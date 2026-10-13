import { z } from "zod"

export const MAX_TAGS = 5

export const parseTags = (raw?: string): string[] =>
  (raw ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters"),
  category: z.string().optional(),
  tags: z
    .string()
    .optional()
    .refine(
      (value) => parseTags(value).length <= MAX_TAGS,
      `Tags must be at most ${MAX_TAGS}`,
    ),
})

export type PostFormValues = z.infer<typeof postFormSchema>

export const toPostFormData = (
  values: PostFormValues,
  image: File | null,
): FormData => {
  const formData = new FormData()
  formData.append("title", values.title)
  formData.append("description", values.description)

  if (values.category) formData.append("category", values.category)

  const tags = parseTags(values.tags).slice(0, MAX_TAGS)
  if (tags.length > 0) formData.append("tags", JSON.stringify(tags))

  if (image) formData.append("image", image)

  return formData
}
