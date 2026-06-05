import type { NextFunction, Request, Response } from "express";
import { GeminiServiceError } from "../services/gemini.service.js";
import { GmailAuthError } from "../services/gmailAuth.service.js";
import { GmailServiceError } from "../services/gmail.service.js";
import type { ApiErrorResponse } from "../types/api.types.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof GmailAuthError) {
    const body: ApiErrorResponse = {
      success: false,
      error: { message: error.message, step: error.step },
    };
    res.status(401).json(body);
    return;
  }

  if (error instanceof GmailServiceError) {
    const body: ApiErrorResponse = {
      success: false,
      error: { message: error.message, step: error.step },
    };
    res.status(502).json(body);
    return;
  }

  if (error instanceof GeminiServiceError) {
    const body: ApiErrorResponse = {
      success: false,
      error: { message: error.message, step: error.step },
    };
    res.status(502).json(body);
    return;
  }

  const message =
    error instanceof Error ? error.message : "알 수 없는 서버 오류";

  const body: ApiErrorResponse = {
    success: false,
    error: { message },
  };
  res.status(500).json(body);
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
