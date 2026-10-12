import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Geli email sax ah"),
  password: z.string().min(1, "Password waa loo baahan yahay"),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Magacu waa ugu yaraan 2 xaraf")
      .max(50, "Magacu waa ugu badan 50 xaraf"),
    email: z.email("Geli email sax ah"),
    password: z
      .string()
      .min(8, "Password-ku waa ugu yaraan 8 xaraf")
      .regex(/[A-Za-z]/, "Password-ku waa inuu lahaadaa ugu yaraan hal xaraf")
      .regex(/[0-9]/, "Password-ku waa inuu lahaadaa ugu yaraan hal lambar"),
    confirmPassword: z.string().min(1, "Xaqiiji password-ka"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password-yadu isku mid ma aha",
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
