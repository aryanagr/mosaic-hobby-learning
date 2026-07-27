import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found." } });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "INVALID_REQUEST",
        message: "Please check your goal details.",
        details: error.issues,
      },
    });
    return;
  }
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    response
      .status(error.status)
      .json({ error: { code: "DOMAIN_ERROR", message: error.message } });
    return;
  }
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Could not complete the request.",
    },
  });
};
