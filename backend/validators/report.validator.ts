import { z } from "zod";
import { REPORT_REASONS } from "../models/report.model";

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS, {
    message: "Fadlan dooro sababta",
  }),
  details: z
    .string()
    .trim()
    .max(500, "Faahfaahintu waa ugu badan 500 xaraf")
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;