import type { NextFunction, Request, Response } from "express";

// Role-based access: only the specified role can proceed
export const requireRole =
  (role: "user" | "admin") =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ success: false, message: "You do not have permission (forbidden)" });
    }
    next();
  };
