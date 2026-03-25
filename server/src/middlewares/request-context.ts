import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);

  logger.info(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      query: req.query
    },
    "request:start"
  );

  res.on("finish", () => {
    logger.info(
      {
        requestId: req.requestId,
        statusCode: res.statusCode
      },
      "request:end"
    );
  });

  next();
}
