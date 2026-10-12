import { z } from "zod";
import { passwordSchema } from "./auth.validator";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "magacu waa ugu yaraan 2 xaraf")
    .max(50, "magacu waa ugu badan 50 xaraf")
    .optional(),
  // bio madhan waa la ogol yahay (waxay tirtirtaa bio-da)
  bio: z.string().trim().max(160, "bio waa ugu badan 160 xaraf").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "password-ka hadda waa loo baahan yahay"),
  newPassword: passwordSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
