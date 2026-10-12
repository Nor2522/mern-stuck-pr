import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.model";

// Sida authorize laakiin ikhtiyaari: haddii token saxan uu jiro req.user
// ayaa la buuxiyaa, haddii kale si fudud ayaa loo gudbaa (ma jiro 401).
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
    // token aan sax ahayn / dhacay -> sida soo-gal la'aan
  }
  next();
};

export default optionalAuth;
