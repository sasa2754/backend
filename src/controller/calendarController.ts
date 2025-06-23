import { Request, Response } from 'express';
import { CalendarService } from '../service/calendarService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request { user?: { sub: string; }; }

export class CalendarController {
    constructor(private calendarService: CalendarService) {}

    public createReminder = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);

            const result = await this.calendarService.createReminder(userId, req.body);
            res.status(201).json(result);
        } catch (error) { this.handleError(error, res); }
    };

    public getCalendar = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);

            const result = await this.calendarService.getAllEvents(userId);
            res.status(200).json(result);
        } catch (error) { this.handleError(error, res); }
    };

    public getCalendarNext = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            
            const result = await this.calendarService.getNextSevenDaysEvents(userId);
            res.status(200).json(result);
        } catch (error) { this.handleError(error, res); }
    };

    private handleError(error: unknown, res: Response) {
        if (error instanceof AppError) {
            return res.json({ message: error.message });
        }
        console.error("ERRO NO CALENDAR CONTROLLER:", error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}