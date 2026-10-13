import { z } from "zod";

export const roleUpdateSchema = z.object({
  role: z.enum(["user", "admin"], {
    message: "Role must be 'user' or 'admin'",
  }),
});

export const banUpdateSchema = z.object({
  isBanned: z.boolean({ message: "isBanned must be a boolean" }),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});