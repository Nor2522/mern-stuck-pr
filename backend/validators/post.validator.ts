import { z } from "zod";

// tags-ku wuxuu ka iman karaa multipart sida JSON string, comma string ama array
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
}, z.array(z.string().min(1).max(30)).max(5, "tags waa ugu badan 5"));

// category: ObjectId ama slug; string madhan waxaa loo arkaa "lama bixin"
const categorySchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().optional(),
);

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "title waa ugu yaraan 3 xaraf")
    .max(120, "title waa ugu badan 120 xaraf"),
  description: z
    .string()
    .trim()
    .min(1, "description waa loo baahan yahay")
    .max(2000, "description waa ugu badan 2000 xaraf"),
  category: categorySchema,
  tags: tagsSchema.optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
