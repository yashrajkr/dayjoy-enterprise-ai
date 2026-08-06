import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500, public code?: string) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} not found`, 404, 'NOT_FOUND'); }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400, 'VALIDATION_ERROR'); }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); }
}

export function errorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction) {
  logger.error('Error:', { message: err.message, stack: err.stack });
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code || 'ERROR', message: err.message });
  }
  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
