import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Wuxuu hubinayaa req.body iyadoo la isticmaalayo zod schema.
// Xog kasta oo aan sax ahayn -> 400 leh jawaab { success:false, message, errors }.
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
        message: errors[0]?.message ?? "Xog aan sax ahayn",
        errors,
      });
    }

    // Ku beddel req.body xogta la nadiifiyay (trim/lowecase iwm)
    req.body = result.data;
    return next();
  };
