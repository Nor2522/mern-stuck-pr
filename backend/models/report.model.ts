import mongoose, { type InferSchemaType } from "mongoose";

const { Schema } = mongoose;

export const REPORT_REASONS = [
  "spam",
  "harassment",
  "misleading",
  "inappropriate",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

const reportSchema = new Schema(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Hal isticmaale kaliya ayaa hal post soo sheegi kara
reportSchema.index({ reporter: 1, post: 1 }, { unique: true });

export type ReportType = InferSchemaType<typeof reportSchema>;

const Report = mongoose.model("Report", reportSchema);

export default Report;