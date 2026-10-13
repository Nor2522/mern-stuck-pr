import { z } from "zod";

export const MAX_PAGE_LIMIT = 50;

// Shared pagination for public list endpoints.
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
