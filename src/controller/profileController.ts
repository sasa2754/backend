import { Request, Response } from 'express';
import { ProfileService } from '../service/profileService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: { sub: string; };
}

export class ProfileController {
    constructor(private profileService: ProfileService) {}

    public getProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }
            const result = await this.profileService.getProfileData(userId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO BUSCAR PERFIL:", error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    };

    public updateProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }

            // O campo 'interests' vem do req.body, e a foto do req.file
            const { interests } = req.body;
            const photoFile = req.file;

            await this.profileService.updateProfile(userId, { interests }, photoFile);
            
            res.status(200).json({ response: true });
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO EDITAR PERFIL:", error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    };
}