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

export const statusUpdateSchema = z.object({
  status: z.enum(["published", "hidden"], {
    message: "Status must be 'published' or 'hidden'",
  }),
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional(),
  status: z.enum(["published", "hidden"]).optional(),
  sort: z.enum(["newest", "oldest", "popular"]).default("newest"),
});

export const reportUpdateSchema = z.object({
  status: z.enum(["resolved", "dismissed"], {
    message: "Status must be 'resolved' or 'dismissed'",
  }),
});

export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["open", "resolved", "dismissed"]).optional(),
});

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional(),
});

export const categoryWriteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
});