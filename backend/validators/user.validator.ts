import { z } from "zod";
import { passwordSchema } from "./auth.validator";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name must be at least 2 characters")
    .max(50, "name must be at most 50 characters")
    .optional(),
  // an empty bio is allowed (it clears the bio)
  bio: z.string().trim().max(160, "bio must be at most 160 characters").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "current password is required"),
  newPassword: passwordSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
