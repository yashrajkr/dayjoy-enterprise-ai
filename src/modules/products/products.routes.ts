import { Router } from 'express';
import { listProductsController, getProductController } from './products.controller';
import { authenticate } from '../../middleware/authenticate';

export const productsRouter = Router();
productsRouter.use(authenticate);
productsRouter.get('/', listProductsController);
productsRouter.get('/:id', getProductController);
