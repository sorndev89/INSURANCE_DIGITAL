import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, 'bad_request', message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, 'unauthorized', message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, 'forbidden', message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, 'not_found', message);
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError(409, 'conflict', message, details);
  }
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: { code: 'route_not_found', message: `Route ${req.method} ${req.path} not found` },
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, 'internal_error', 'Internal Server Error');

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  res.status(apiError.status).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details !== undefined ? { details: apiError.details } : {}),
    },
  });
};
