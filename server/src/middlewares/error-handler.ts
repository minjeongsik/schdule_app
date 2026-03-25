import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    logger.error(
      {
        requestId: req.requestId,
        statusCode: error.statusCode,
        details: error.details
      },
      error.message
    );

    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
      requestId: req.requestId
    });
    return;
  }

  if (error instanceof ZodError) {
    logger.error({ requestId: req.requestId, issues: error.issues }, "schema validation failed");
    res.status(400).json({
      message: "Validation failed",
      details: error.flatten(),
      requestId: req.requestId
    });
    return;
  }

  logger.error({ requestId: req.requestId, error }, "unexpected error");
  res.status(500).json({
    message: "Internal server error",
    requestId: req.requestId
  });
}
