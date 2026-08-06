import { Request, Response } from 'express';
import { asyncHandler, ValidationError } from '../../middleware/errorHandler';
import { register, login } from './auth.service';

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, tenantId } = req.body;
  if (!email || !password) throw new ValidationError('Email and password required');
  const result = await register({ email, password, firstName, lastName, phone, tenantId: tenantId || 'dayjoy' });
  res.status(201).json({ data: result, message: 'User registered' });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, tenantId } = req.body;
  if (!email || !password) throw new ValidationError('Email and password required');
  const result = await login({ email, password }, tenantId || 'dayjoy');
  res.json({ data: result, message: 'Login successful' });
});
