import { z } from "zod"

export const REPORT_REASONS = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "misleading", label: "Misleading content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
] as const

export const reportSchema = z.object({
  reason: z.string().min(1, "Fadlan dooro sabab"),
  details: z
    .string()
    .trim()
    .max(500, "Faahfaahintu waa ugu badan 500 xaraf")
    .optional(),
})

export type ReportFormValues = z.infer<typeof reportSchema>