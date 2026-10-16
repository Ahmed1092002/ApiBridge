import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "./errors";

/**
 * Centralized Express error handler adhering to ApiBridge error contracts.
 */
export function errorHandler() {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (res.headersSent) {
      return _next(err as Error);
    }

    if (err instanceof HttpError) {
      const responsePayload: Record<string, unknown> = {
        statusCode: err.statusCode,
        error: err.errorCode,
        message: err.message,
      };

      if (err.issues && err.issues.length > 0) {
        responsePayload.issues = err.issues;
      }

      if ("resource" in err && err.resource) {
        responsePayload.resource = err.resource;
      }

      res.status(err.statusCode).json(responsePayload);
      return;
    }

    if (err instanceof ZodError) {
      res.status(400).json({
        statusCode: 400,
        error: "VALIDATION_ERROR",
        message: "Validation failed",
        issues: err.errors.map((e) => ({
          path: e.path,
          message: e.message,
          code: e.code,
        })),
      });
      return;
    }

    // Body parser JSON syntax error
    if (
      err instanceof SyntaxError &&
      "status" in err &&
      (err as { status: number }).status === 400
    ) {
      res.status(400).json({
        statusCode: 400,
        error: "VALIDATION_ERROR",
        message: "Malformed JSON payload",
        issues: [{ path: ["body"], message: err.message }],
      });
      return;
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({
      statusCode: 500,
      error: "INTERNAL_SERVER_ERROR",
      message,
    });
  };
}
