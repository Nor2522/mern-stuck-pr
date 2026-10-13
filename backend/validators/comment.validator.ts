import { z } from "zod";

export const addCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be at most 500 characters"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
