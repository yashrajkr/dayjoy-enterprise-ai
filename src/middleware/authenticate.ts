import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../modules/auth/auth.service';
import { UnauthorizedError } from './errorHandler';

export interface AuthRequest extends Request { user?: TokenPayload; tenantId?: string; }

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new UnauthorizedError('Missing authorization');
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  req.user = payload;
  req.tenantId = payload.tenantId;
  next();
}

export function requirePermission(resource: string, action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement permission check
    next();
  };
}
