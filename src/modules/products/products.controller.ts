import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { listProducts, getProductById } from './products.service';
import { AuthRequest } from '../../middleware/authenticate';

export const listProductsController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await listProducts(req.tenantId!, Number(page) || 1, Number(limit) || 20);
  res.json(result);
});

export const getProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await getProductById(req.params.id, req.tenantId!);
  res.json({ data: product });
});
