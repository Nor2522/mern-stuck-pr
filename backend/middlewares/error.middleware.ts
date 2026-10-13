import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Unknown route -> always return JSON 404
export const notFound = (req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// Global error middleware: format { success: false, message }
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const status = err instanceof HttpError ? err.status : 500;
  const message =
    err instanceof Error && (!isProduction || status < 500)
      ? err.message
      : "Internal server error";

  const body: { success: false; message: string; stack?: string } = {
    success: false,
    message,
  };

  if (!isProduction && err instanceof Error) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};
