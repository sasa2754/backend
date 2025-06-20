import { Request, Response } from 'express';
import { ManagerService } from '../service/managerService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: 'admin' | 'manager' | 'employee';
        company?: string | null;
    };
}

export class ManagerController {
    constructor(private managerService: ManagerService) {}

    public enrollEmployee = async (req: AuthRequest, res: Response) => {
        try {
            const managerId = req.user?.sub;
            const managerCompanyId = req.user?.company;

            if (!managerId || !managerCompanyId) {
                throw new AppError('Token inválido ou não contém as informações necessárias de manager.', 401);
            }

            const result = await this.managerService.enrollEmployeeInCourse(managerId, managerCompanyId, req.body);
            res.status(200).json(result);

        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO INSCREVER FUNCIONÁRIO:", error);
            res.status(500).json({ message: 'Erro interno no servidor.' });
        }
    };
}