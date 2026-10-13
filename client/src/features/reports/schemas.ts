import { z } from "zod"

export const REPORT_REASONS = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "misleading", label: "Misleading content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
] as const

export const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z
    .string()
    .trim()
    .max(500, "Details must be at most 500 characters")
    .optional(),
})

export type ReportFormValues = z.infer<typeof reportSchema>