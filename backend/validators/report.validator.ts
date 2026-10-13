import { z } from "zod";
import { REPORT_REASONS } from "../models/report.model";

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS, {
    message: "Please select a reason",
  }),
  details: z
    .string()
    .trim()
    .max(500, "Details must be at most 500 characters")
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;