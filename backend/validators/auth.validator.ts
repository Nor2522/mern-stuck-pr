import { z } from "zod";

// password: at least 8 characters, one letter and one number
export const passwordSchema = z
  .string()
  .min(8, "password must be at least 8 characters")
  .regex(/[A-Za-z]/, "password must contain at least one letter")
  .regex(/[0-9]/, "password must contain at least one number");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name must be at least 2 characters")
    .max(50, "name must be at most 50 characters"),
  email: z.string().trim().toLowerCase().email("enter a valid email"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("enter a valid email"),
  password: z.string().min(1, "password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
