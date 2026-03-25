import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { logger } from "../../utils/logger.js";
import { createPlaceSchema, listPlacesQuerySchema, removePlaceQuerySchema, updatePlaceSchema } from "./places.schema.js";

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new HttpError(400, "User not found");
  }
}

export class PlacesService {
  async list(query: unknown) {
    const parsed = listPlacesQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ query: parsed.data }, "places-service:list");

    return prisma.place.findMany({
      where: {
        userId: parsed.data.userId,
        ...(parsed.data.query
          ? {
              name: {
                contains: parsed.data.query
              }
            }
          : {})
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }]
    });
  }

  async create(input: unknown) {
    const parsed = createPlaceSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    await ensureUserExists(parsed.data.userId);
    logger.debug({ input: parsed.data }, "places-service:create");

    return prisma.place.create({
      data: parsed.data
    });
  }

  async update(id: string, input: unknown) {
    const parsed = updatePlaceSchema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, input: parsed.data }, "places-service:update");

    const place = await prisma.place.findUnique({
      where: { id }
    });

    if (!place) {
      throw new HttpError(404, "Place not found");
    }

    if (place.userId !== parsed.data.userId) {
      throw new HttpError(404, "Place not found");
    }

    return prisma.place.update({
      where: { id },
      data: {
        name: parsed.data.name,
        roadAddress: parsed.data.roadAddress,
        jibunAddress: parsed.data.jibunAddress,
        lat: parsed.data.lat,
        lng: parsed.data.lng
      }
    });
  }

  async remove(id: string, query: unknown) {
    const parsed = removePlaceQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    logger.debug({ id, query: parsed.data }, "places-service:remove");

    const place = await prisma.place.findUnique({
      where: { id }
    });

    if (!place) {
      throw new HttpError(404, "Place not found");
    }

    if (place.userId !== parsed.data.userId) {
      throw new HttpError(404, "Place not found");
    }

    const destinationUsageCount = await prisma.appointment.count({
      where: {
        userId: parsed.data.userId,
        destinationPlaceId: id
      }
    });

    if (destinationUsageCount > 0) {
      throw new HttpError(409, "Place is used as a destination in existing appointments");
    }

    const routeUsageCount = await prisma.savedRoute.count({
      where: {
        appointment: {
          userId: parsed.data.userId
        },
        OR: [{ originPlaceId: id }, { destinationPlaceId: id }]
      }
    });

    if (routeUsageCount > 0) {
      throw new HttpError(409, "Place is used in saved routes");
    }

    await prisma.place.delete({
      where: { id }
    });
  }
}
