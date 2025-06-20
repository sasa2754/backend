import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { NotificationController } from '../controller/notificationController.ts';

const notificationRouter = Router();
const notificationController = new NotificationController();

// Agora as rotas chamam os métodos do controller, muito mais limpo!
notificationRouter.get('/', authMiddleware, notificationController.getNotifications);
notificationRouter.patch('/:notificationId/read', authMiddleware, notificationController.markAsRead);

export default notificationRouter;