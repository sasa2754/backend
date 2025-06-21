import { Request, Response } from 'express';
import { ActivityService } from '../service/activityService.ts';
import { AppError } from '../error/AppError.ts';

// Interface para requisições que passaram pelo authMiddleware
interface AuthRequest extends Request {
    user?: {
        sub: string;
        // ... outras propriedades do token
    };
}

export class ActivityController {
    constructor(private activityService: ActivityService) {}

    /**
     * Gerencia a requisição de submissão de um PDF de atividade.
     */
    public submitPdf = async (req: AuthRequest, res: Response) => {
        try {
            // 1. Pega o ID do usuário do token (validado pelo authMiddleware)
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }

            // 2. Pega os IDs da URL
            const { courseId, lessonId } = req.params;

            // 3. Pega o arquivo que o middleware 'Multer' processou e anexou à requisição
            const file = req.file;

            // 4. Chama o serviço com todas as informações
            const result = await this.activityService.submitPdf(userId, courseId, lessonId, file);
            
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO NO ACTIVITY CONTROLLER:", error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    };
}