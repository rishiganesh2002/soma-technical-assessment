import { z } from "zod";

// Schema for adding dependencies (POST request body)
export const AddDependenciesSchema = z.object({
  dependencies: z
    .array(z.number().int().positive())
    .min(1, "At least one dependency is required"),
});

// Schema for deleting dependencies (query parameters)
export const DeleteDependenciesSchema = z.object({
  dependencyIds: z
    .string()
    .regex(/^\d+(,\d+)*$/, "dependencyIds must be comma-separated integers"),
});

// Schema for route parameters (todo ID)
export const TodoIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number"),
});

// Types
export type AddDependenciesInput = z.infer<typeof AddDependenciesSchema>;
export type DeleteDependenciesInput = z.infer<typeof DeleteDependenciesSchema>;
export type TodoIdParams = z.infer<typeof TodoIdParamsSchema>;
