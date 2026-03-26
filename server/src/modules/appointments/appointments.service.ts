import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { logger } from "../../utils/logger.js";
import {
  createAppointmentSchema,
  createRouteSchema,
  listAppointmentsQuerySchema,
  updateRouteSchema,
  updateAppointmentSchema
} from "./appointments.schema.js";

const appointmentInclude = Prisma.validator<Prisma.AppointmentInclude>()({
  originPlace: true,
  destinationPlace: true,
  routes: {
    include: {
      waypoints: {
        orderBy: {
          sequence: "asc"
        }
      }
    },
    orderBy: [{ selectedOption: "desc" }, { createdAt: "asc" }]
  }
});

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new HttpError(400, "User not found");
  }
}

async function ensurePlaceExists(userId: string, placeId: string, label: "originPlaceId" | "destinationPlaceId") {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, userId: true }
  });

  if (!place || place.userId !== userId) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

function validateTimeRange(startAt: Date, endAt?: Date | null) {
  if (endAt && endAt <= startAt) {
    throw new HttpError(400, "endAt must be later than startAt");
  }
}

export class AppointmentsService {
  async list(query: unknown) {
    const parsed = listAppointmentsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ query: parsed.data }, "appointments-service:list");

    return prisma.appointment.findMany({
      where: {
        userId: parsed.data.userId,
        status: parsed.data.status,
        startAt: {
          gte: parsed.data.from,
          lte: parsed.data.to
        }
      },
      include: appointmentInclude,
      orderBy: { startAt: "asc" }
    });
  }

  async get(id: string) {
    logger.debug({ id }, "appointments-service:get");

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude
    });

    if (!appointment) {
      throw new HttpError(404, "Appointment not found");
    }

    return appointment;
  }

  async create(input: unknown) {
    const parsed = createAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    validateTimeRange(parsed.data.startAt, parsed.data.endAt);
    await ensureUserExists(parsed.data.userId);
    await ensurePlaceExists(parsed.data.userId, parsed.data.destinationPlaceId, "destinationPlaceId");

    if (parsed.data.originPlaceId) {
      await ensurePlaceExists(parsed.data.userId, parsed.data.originPlaceId, "originPlaceId");
    }

    logger.debug({ input: parsed.data }, "appointments-service:create");

    return prisma.appointment.create({
      data: parsed.data,
      include: appointmentInclude
    });
  }

  async update(id: string, input: unknown) {
    const parsed = updateAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, input: parsed.data }, "appointments-service:update");

    const current = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!current) {
      throw new HttpError(404, "Appointment not found");
    }

    const nextStartAt = parsed.data.startAt ?? current.startAt;
    const nextEndAt = parsed.data.endAt === undefined ? current.endAt : parsed.data.endAt;
    validateTimeRange(nextStartAt, nextEndAt);

    if (parsed.data.destinationPlaceId) {
      await ensurePlaceExists(current.userId, parsed.data.destinationPlaceId, "destinationPlaceId");
    }

    if (parsed.data.originPlaceId) {
      await ensurePlaceExists(current.userId, parsed.data.originPlaceId, "originPlaceId");
    }

    return prisma.appointment.update({
      where: { id },
      data: parsed.data,
      include: appointmentInclude
    });
  }

  async selectRoute(id: string, routeId: string) {
    logger.debug({ id, routeId }, "appointments-service:selectRoute");

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!appointment) {
      throw new HttpError(404, "Appointment not found");
    }

    const route = await prisma.savedRoute.findFirst({
      where: {
        id: routeId,
        appointmentId: id
      },
      select: { id: true }
    });

    if (!route) {
      throw new HttpError(404, "Route not found");
    }

    await prisma.$transaction([
      prisma.savedRoute.updateMany({
        where: {
          appointmentId: id,
          selectedOption: true
        },
        data: {
          selectedOption: false
        }
      }),
      prisma.savedRoute.update({
        where: { id: routeId },
        data: {
          selectedOption: true
        }
      })
    ]);

    return prisma.appointment.findUniqueOrThrow({
      where: { id },
      include: appointmentInclude
    });
  }

  async createRoute(id: string, input: unknown) {
    const parsed = createRouteSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, input: parsed.data }, "appointments-service:createRoute");

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        originPlaceId: true,
        destinationPlaceId: true,
        routes: {
          select: {
            id: true,
            selectedOption: true
          }
        }
      }
    });

    if (!appointment) {
      throw new HttpError(404, "Appointment not found");
    }

    if (!appointment.originPlaceId) {
      throw new HttpError(400, "Appointment must have an origin place before adding routes");
    }

    const shouldSelect = parsed.data.selectedOption ?? appointment.routes.every((route) => !route.selectedOption);

    await prisma.$transaction(async (tx) => {
      if (shouldSelect) {
        await tx.savedRoute.updateMany({
          where: {
            appointmentId: id,
            selectedOption: true
          },
          data: {
            selectedOption: false
          }
        });
      }

      await tx.savedRoute.create({
        data: {
          appointmentId: id,
          originPlaceId: appointment.originPlaceId!,
          destinationPlaceId: appointment.destinationPlaceId,
          summary: parsed.data.summary,
          distanceMeters: parsed.data.distanceMeters,
          durationSeconds: parsed.data.durationSeconds,
          selectedOption: shouldSelect,
          waypoints: parsed.data.waypoints?.length
            ? {
                create: parsed.data.waypoints.map((waypoint, index) => ({
                  sequence: index + 1,
                  name: waypoint.name,
                  lat: waypoint.lat,
                  lng: waypoint.lng
                }))
              }
            : undefined
        }
      });
    });

    return prisma.appointment.findUniqueOrThrow({
      where: { id },
      include: appointmentInclude
    });
  }

  async updateRoute(id: string, routeId: string, input: unknown) {
    const parsed = updateRouteSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, routeId, input: parsed.data }, "appointments-service:updateRoute");

    const route = await prisma.savedRoute.findFirst({
      where: {
        id: routeId,
        appointmentId: id
      },
      select: {
        id: true,
        appointmentId: true
      }
    });

    if (!route) {
      throw new HttpError(404, "Route not found");
    }

    await prisma.$transaction(async (tx) => {
      if (parsed.data.selectedOption) {
        await tx.savedRoute.updateMany({
          where: {
            appointmentId: id,
            selectedOption: true
          },
          data: {
            selectedOption: false
          }
        });
      }

      await tx.savedRoute.update({
        where: { id: routeId },
        data: {
          summary: parsed.data.summary,
          distanceMeters: parsed.data.distanceMeters,
          durationSeconds: parsed.data.durationSeconds,
          selectedOption: parsed.data.selectedOption,
          waypoints: parsed.data.waypoints
            ? {
                deleteMany: {},
                create: parsed.data.waypoints.map((waypoint, index) => ({
                  sequence: index + 1,
                  name: waypoint.name,
                  lat: waypoint.lat,
                  lng: waypoint.lng
                }))
              }
            : undefined
        }
      });
    });

    return prisma.appointment.findUniqueOrThrow({
      where: { id },
      include: appointmentInclude
    });
  }

  async removeRoute(id: string, routeId: string) {
    logger.debug({ id, routeId }, "appointments-service:removeRoute");

    const route = await prisma.savedRoute.findFirst({
      where: {
        id: routeId,
        appointmentId: id
      },
      select: {
        id: true,
        selectedOption: true
      }
    });

    if (!route) {
      throw new HttpError(404, "Route not found");
    }

    await prisma.savedRoute.delete({
      where: { id: routeId }
    });

    if (route.selectedOption) {
      const fallbackRoute = await prisma.savedRoute.findFirst({
        where: { appointmentId: id },
        orderBy: { createdAt: "asc" },
        select: { id: true }
      });

      if (fallbackRoute) {
        await prisma.savedRoute.update({
          where: { id: fallbackRoute.id },
          data: { selectedOption: true }
        });
      }
    }

    return prisma.appointment.findUniqueOrThrow({
      where: { id },
      include: appointmentInclude
    });
  }

  async remove(id: string) {
    logger.debug({ id }, "appointments-service:remove");

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!appointment) {
      throw new HttpError(404, "Appointment not found");
    }

    await prisma.appointment.delete({
      where: { id }
    });
  }
}
