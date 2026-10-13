import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.model";

// Like authorize but optional: if valid token exists, populate req.user;
// otherwise continue without user (no 401).
const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined = req.cookies?.token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET as string) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
  } catch {
    // Invalid or expired token -> treat as unauthenticated
  }
  next();
};

export default optionalAuth;
