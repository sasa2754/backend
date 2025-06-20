import { Request, Response } from 'express';
import { AuthService } from '../service/authService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: 'admin' | 'manager' | 'employee';
        company?: string | null;
    };
}

export class AuthController {
  constructor(private authService: AuthService) {}

  public login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public forgotPassword = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(200).json({ response: true });
    }
  };

  public checkCode = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.checkCode(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public resendCode = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.resendCode(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(200).json({ response: true });
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public setInitialPassword = async (req: AuthRequest, res: Response) => {
        try {
            // O ID do usuário vem do token, que o middleware já validou
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('ID do usuário não encontrado no token.', 401);
            }

            const result = await this.authService.setInitialPassword(req.body, userId);
            res.status(200).json(result);

        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO INESPERADO AO DEFINIR SENHA INICIAL:", error); 
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}