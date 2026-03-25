import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { logger } from "../../utils/logger.js";
import { createAppointmentSchema, listAppointmentsQuerySchema, updateAppointmentSchema } from "./appointments.schema.js";

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
