import Notification from '../model/notificationModel.ts';

export class NotificationService {


    public async createNotification(userId: string, message: string, link?: string): Promise<void> {
        try {
            await Notification.create({
                user: userId,
                message,
                link: link || undefined,
            });
            console.log(`Notificação criada para o usuário ${userId}`);
        } catch (error) {
            console.error("Erro ao criar notificação:", error);
        }
    }

}