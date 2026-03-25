import { z } from "zod";

export const listPlacesQuerySchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  query: z.string().trim().optional()
});

export const createPlaceSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  name: z.string().trim().min(1, "name is required").max(100, "name is too long"),
  roadAddress: z.string().trim().max(200, "roadAddress is too long").optional(),
  jibunAddress: z.string().trim().max(200, "jibunAddress is too long").optional(),
  lat: z.number().min(-90, "lat is invalid").max(90, "lat is invalid"),
  lng: z.number().min(-180, "lng is invalid").max(180, "lng is invalid")
});

export const updatePlaceSchema = z
  .object({
    userId: z.string().trim().min(1, "userId is required"),
    name: z.string().trim().min(1, "name cannot be empty").max(100, "name is too long").optional(),
    roadAddress: z.string().trim().max(200, "roadAddress is too long").nullable().optional(),
    jibunAddress: z.string().trim().max(200, "jibunAddress is too long").nullable().optional(),
    lat: z.number().min(-90, "lat is invalid").max(90, "lat is invalid").optional(),
    lng: z.number().min(-180, "lng is invalid").max(180, "lng is invalid").optional()
  })
  .refine((value) => Object.keys(value).some((key) => key !== "userId"), {
    message: "At least one field must be provided"
  });

export const removePlaceQuerySchema = z.object({
  userId: z.string().trim().min(1, "userId is required")
});
