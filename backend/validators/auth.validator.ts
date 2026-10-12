import { z } from "zod";

// password: ugu yaraan 8 xaraf, hal xaraf iyo hal lambar
export const passwordSchema = z
  .string()
  .min(8, "password waa ugu yaraan 8 xaraf")
  .regex(/[A-Za-z]/, "password waa inuu lahaadaa ugu yaraan hal xaraf")
  .regex(/[0-9]/, "password waa inuu lahaadaa ugu yaraan hal lambar");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "magacu waa ugu yaraan 2 xaraf")
    .max(50, "magacu waa ugu badan 50 xaraf"),
  email: z.string().trim().toLowerCase().email("email sax ah geli"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("email sax ah geli"),
  password: z.string().min(1, "password waa loo baahan yahay"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
