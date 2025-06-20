import { Router } from 'express';
import { AuthController } from '../controller/authController.ts';
import { AuthService } from '../service/authService.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const authRouter = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

authRouter.post('/login', authController.login);
authRouter.post('/forgotPass', authController.forgotPassword);
authRouter.post('/checkCode', authController.checkCode);
authRouter.post('/resendCode', authController.resendCode);
authRouter.post('/resetPassword', authController.resetPassword);
authRouter.post(
    '/set-initial-password', 
    authMiddleware,
    authController.setInitialPassword
);

export default authRouter;