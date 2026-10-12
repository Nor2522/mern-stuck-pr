import type { NextFunction, Request, RequestHandler, Response } from "express";

// Waxay qabataa khaladaadka async-ga oo u gudbisa error middleware-ka
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
