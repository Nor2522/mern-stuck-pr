import { z } from "zod";

// tags can come from multipart as a JSON string, comma string, or array
export const tagsSchema = z.preprocess((value) => {
  if (value === undefined || value === null) return undefined;

  let list: unknown[];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      list = Array.isArray(parsed) ? parsed : trimmed.split(",");
    } catch {
      list = trimmed.split(",");
    }
  } else {
    list = [value];
  }

  return list
    .map((item) => String(item).trim().toLowerCase())
    .filter((item) => item.length > 0);
}, z.array(z.string().min(1).max(30)).max(5, "tags must be at most 5"));

// category: ObjectId or slug; an empty string is treated as "not provided"
const categorySchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().optional(),
);

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "title must be at least 3 characters")
    .max(120, "title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(1, "description is required")
    .max(2000, "description must be at most 2000 characters"),
  category: categorySchema,
  tags: tagsSchema.optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
