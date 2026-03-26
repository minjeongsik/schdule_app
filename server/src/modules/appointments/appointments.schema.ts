import { z } from "zod";

const trimmedOptionalString = z.string().trim().min(1).optional();
const transportModeSchema = z.enum(["WALK", "CAR", "TRANSIT", "BICYCLE"]);
const appointmentStatusSchema = z.enum(["SCHEDULED", "COMPLETED", "CANCELED"]);

export const listAppointmentsQuerySchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  status: appointmentStatusSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

export const createAppointmentSchema = z
  .object({
    userId: z.string().trim().min(1, "userId is required"),
    title: z.string().trim().min(1, "title is required").max(120, "title is too long"),
    memo: trimmedOptionalString,
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    transportMode: transportModeSchema,
    destinationPlaceId: z.string().trim().min(1, "destinationPlaceId is required"),
    originPlaceId: z.string().trim().min(1).optional()
  })
  .superRefine((value, ctx) => {
    if (value.endAt && value.endAt <= value.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endAt"],
        message: "endAt must be later than startAt"
      });
    }
  });

export const updateAppointmentSchema = z
  .object({
    title: z.string().trim().min(1, "title cannot be empty").max(120, "title is too long").optional(),
    memo: z.string().trim().max(1000, "memo is too long").nullable().optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().nullable().optional(),
    transportMode: transportModeSchema.optional(),
    status: appointmentStatusSchema.optional(),
    destinationPlaceId: z.string().trim().min(1).optional(),
    originPlaceId: z.string().trim().min(1).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export const createRouteSchema = z.object({
  summary: z.string().trim().max(200, "summary is too long").optional(),
  distanceMeters: z.number().int().positive("distanceMeters must be greater than 0"),
  durationSeconds: z.number().int().positive("durationSeconds must be greater than 0"),
  selectedOption: z.boolean().optional(),
  waypoints: z
    .array(
      z.object({
        name: z.string().trim().max(100, "waypoint name is too long").optional(),
        lat: z.number().min(-90, "lat is invalid").max(90, "lat is invalid"),
        lng: z.number().min(-180, "lng is invalid").max(180, "lng is invalid")
      })
    )
    .max(20, "Too many waypoints")
    .optional()
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
