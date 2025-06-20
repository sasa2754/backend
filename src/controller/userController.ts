import { Request, Response } from 'express';
import { UserService } from '../service/userService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: 'admin' | 'manager' | 'employee';
        company?: string | null;
    };
}

export class UserController {
    constructor(private userService: UserService) {}

    public createUser = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.role) {
                throw new AppError('Não foi possível identificar a permissão do usuário.', 403);
            }

            const creatorRole = req.user.role as 'admin' | 'manager';
            const companyId = req.user.company;

            const result = await this.userService.createUser(req.body, creatorRole, companyId);
            
            res.status(201).json(result);

        } catch (error) {
            if (error instanceof AppError) {
                // VERSÃO CORRETA: com return, status e .message
                return res.json({ message: error });
            }
            
            console.error("ERRO INESPERADO NO USER CONTROLLER:", error); 
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}