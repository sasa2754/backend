import { Request, Response } from 'express';
import { AuthService } from '../service/authService.ts';

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
}