import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.model";

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined = req.cookies?.token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Unathorized please login" });

    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user-kan ma jiro",
      });

    if (user.isBanned) {
      return res
        .status(403)
        .json({ success: false, message: "Account suspended" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unathorized",
    });
  }
};

export default authorize;
