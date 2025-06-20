import { Request, Response } from 'express';
import { AppError } from '../error/AppError.ts';
import Notification from '../model/notificationModel.ts';

// Interface para requisições que passaram pelo authMiddleware
interface AuthRequest extends Request {
    user?: { sub: string; /* ... */ };
}

export class NotificationController {

    public getNotifications = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }
            
            const notifications = await Notification.find({ user: userId })
                .sort({ isRead: 1, createdAt: -1 })
                .limit(50);
            
            res.status(200).json(notifications);
        } catch (error) {
            console.error("ERRO AO BUSCAR NOTIFICAÇÕES:", error);
            res.status(500).json({ message: "Erro ao buscar notificações." });
        }
    };

    public markAsRead = async (req: AuthRequest, res: Response) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                res.status(404).json({ message: "Notificação não encontrada ou não pertence a você." });
            }
            res.status(200).json(notification);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error });
            }
            console.error("ERRO AO MARCAR NOTIFICAÇÃO:", error);
            res.status(500).json({ message: "Erro ao marcar notificação como lida." });
        }
    };
}