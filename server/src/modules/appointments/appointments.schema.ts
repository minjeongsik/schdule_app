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

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
