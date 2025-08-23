import { z } from "zod";

export const TodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
});

export const CreateTodoSchema = TodoSchema;

export const TodoIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number"),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type TodoInput = z.infer<typeof TodoSchema>;
export type TodoIdParams = z.infer<typeof TodoIdSchema>;
