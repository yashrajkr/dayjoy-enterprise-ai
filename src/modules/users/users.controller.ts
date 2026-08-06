import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { listUsers, getUserById } from './users.service';
import { AuthRequest } from '../../middleware/authenticate';

export const listUsersController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await listUsers(req.tenantId!, Number(page) || 1, Number(limit) || 20);
  res.json(result);
});

export const getUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getUserById(req.params.id, req.tenantId!);
  res.json({ data: user });
});
