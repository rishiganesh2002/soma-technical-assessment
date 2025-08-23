import { z } from "zod";

export const PexelsSearchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
});

export type PexelsSearchQuery = z.infer<typeof PexelsSearchQuerySchema>;
