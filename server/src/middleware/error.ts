import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const message = err instanceof Error ? err.message : "Unknown server error";
  console.error("[error]", err);
  res.status(500).json({
    ok: false,
    error: { code: "internal_error", message },
  });
}
