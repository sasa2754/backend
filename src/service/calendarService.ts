import mongoose from 'mongoose';
import User from '../model/userModel.ts';
import { AppError } from '../error/AppError.ts';

export class CalendarService {

    /**
     * Adiciona um novo lembrete pessoal ao calendário do usuário.
     */
    public async createReminder(userId: string, data: { title: string, date: string }): Promise<{ response: true }> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // Adiciona o novo lembrete ao array
        user.calendar?.push({
            description: data.title,
            date: new Date(data.date),
            type: 1 // Tipo 1 é sempre para lembretes pessoais
        });

        await user.save();
        return { response: true };
    }

    /**
     * Busca todos os eventos do calendário do usuário (pessoais + prazos de cursos).
     */
    public async getAllEvents(userId: string): Promise<any[]> {
        const user = await User.findById(userId)
            .populate({
                path: 'coursesInProgress.courseId',
                select: 'modules' // Só precisamos dos módulos para encontrar os prazos
            })
            .lean();

        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // 1. Pega os lembretes pessoais já formatados
        const personalReminders = user.calendar?.map(item => ({
            date: item.date,
            type: item.type,
            description: item.description
        })) || [];

        // 2. Extrai os prazos dos cursos em progresso
        const courseDeadlines: any[] = [];
        user.coursesInProgress?.forEach((courseProgress: any) => {
            if (courseProgress.courseId?.modules) {
                courseProgress.courseId.modules.forEach((module: any) => {
                    module.content.forEach((contentItem: any) => {
                        // Se o conteúdo for uma atividade (tipo 3 ou 4) e tiver um prazo
                        if ((contentItem.type === 3 || contentItem.type === 4) && contentItem.deadline) {
                            courseDeadlines.push({
                                date: contentItem.deadline,
                                type: contentItem.type, // Será 3 (Atividade) ou 4 (Prova, se aplicável)
                                description: `Prazo final: ${contentItem.title}`
                            });
                        }
                    });
                });
            }
        });

        // 3. Junta tudo e ordena por data
        const allEvents = [...personalReminders, ...courseDeadlines];
        allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

        // 4. Filtra pela janela de tempo (6 meses antes, 6 meses depois)
        const today = new Date();
        const sixMonthsAgo = new Date().setMonth(today.getMonth() - 6);
        const sixMonthsLater = new Date().setMonth(today.getMonth() + 6);

        const filteredEvents = allEvents.filter(event => {
            const eventTime = event.date.getTime();
            return eventTime >= sixMonthsAgo && eventTime <= sixMonthsLater;
        });

        return filteredEvents;
    }

    /**
     * Busca os eventos dos próximos 7 dias.
     */
    public async getNextSevenDaysEvents(userId: string): Promise<any[]> {
        const allEvents = await this.getAllEvents(userId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera a hora para pegar desde o início do dia
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const upcomingEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate < sevenDaysLater;
        });

        return upcomingEvents;
    }
}