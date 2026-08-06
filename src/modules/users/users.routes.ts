import { Router } from 'express';
import { listUsersController, getUserController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';

export const usersRouter = Router();
usersRouter.use(authenticate);
usersRouter.get('/', listUsersController);
usersRouter.get('/:id', getUserController);
