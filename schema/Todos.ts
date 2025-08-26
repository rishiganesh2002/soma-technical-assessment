import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const TodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  dueDate: z.iso.datetime("Due date must be a valid ISO datetime string"),
  status: z.enum(["pending", "inProgress", "completed"]).default("pending"),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  dependencies: z.array(z.number()).optional(),
  estimatedCompletionDays: z.number().int().positive().default(1),
});

export const TodoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number"),
});

export const UpdateTodoStatusSchema = z.object({
  status: z.enum(["pending", "inProgress", "completed"]),
});

export type CreateTodoInput = z.infer<typeof TodoSchema>;
export type TodoInput = z.infer<typeof TodoSchema>;
export type TodoIdParams = z.infer<typeof TodoIdSchema>;
export type UpdateTodoStatusInput = z.infer<typeof UpdateTodoStatusSchema>;

// API-facing types
export type TodoWithRelations = Prisma.TodoGetPayload<{
  include: { dependencies: true; dependents: true };
}>;
