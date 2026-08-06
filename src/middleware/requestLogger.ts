import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  logger.http(`${req.method} ${req.path}`);
  res.on('finish', () => {
    logger.http(`${req.method} ${req.path} ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
}
