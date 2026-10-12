import { z } from "zod"

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Magacu waa ugu yaraan 2 xaraf")
    .max(50, "Magacu waa ugu badan 50 xaraf"),
  bio: z.string().trim().max(160, "Bio waa ugu badan 160 xaraf").optional(),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Password-ka hadda waa loo baahan yahay"),
    newPassword: z
      .string()
      .min(8, "Password-ku waa ugu yaraan 8 xaraf")
      .regex(/[A-Za-z]/, "Password-ku waa inuu lahaadaa ugu yaraan hal xaraf")
      .regex(/[0-9]/, "Password-ku waa inuu lahaadaa ugu yaraan hal lambar"),
    confirmPassword: z.string().min(1, "Xaqiiji password-ka"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password-yadu isku mid ma aha",
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
