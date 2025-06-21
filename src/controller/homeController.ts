import { Request, Response } from 'express';
import { HomeService } from '../service/homeService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: { sub: string; };
}

export class HomeController {
    constructor(private homeService: HomeService) {}

    public getProgress = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }

            const result = await this.homeService.getPersonalProgress(userId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO BUSCAR DADOS DA HOME:", error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    };
}