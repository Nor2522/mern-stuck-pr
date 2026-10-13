import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Validates req.body using zod schema.
// If validation fails -> 400 with { success:false, message, errors }.
export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: errors[0]?.message ?? "Invalid data",
        errors,
      });
    }

    // Replace req.body with sanitized data (trim/lowercase etc)
    req.body = result.data;
    return next();
  };
