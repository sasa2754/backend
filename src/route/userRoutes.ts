import { Router } from 'express';

import { UserController } from '../controller/userController.ts';
import { UserService } from '../service/userService.ts';
import { authMiddleware, checkRole } from '../middleware/authMiddleware.ts';

const userRouter = Router();

const userService = new UserService();
const userController = new UserController(userService);

userRouter.post('/', authMiddleware, checkRole(['admin', 'manager']), userController.createUser );

export default userRouter;