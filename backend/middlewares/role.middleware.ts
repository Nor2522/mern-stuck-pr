import type { NextFunction, Request, Response } from "express";

// Fasaxa doorka: kaliya doorka la sheegay ayaa gudba
export const requireRole =
  (role: "user" | "admin") =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ success: false, message: "Ma lihid fasax (forbidden)" });
    }
    next();
  };
