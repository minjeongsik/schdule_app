import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().default("")
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(120, "Title is too long").optional(),
    description: z.string().trim().max(500, "Description is too long").optional(),
    completed: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });
