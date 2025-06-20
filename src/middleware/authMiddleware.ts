import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: 'admin' | 'manager' | 'employee';
        company: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('Token não fornecido.', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const jwtSecret = process.env.SECRET;
        if (!jwtSecret) {
            throw new AppError('Chave secreta JWT não configurada.', 500);
        }

        const decoded = jwt.verify(token, jwtSecret) as { sub: string; role: 'admin' | 'manager' | 'employee', company: string };

        req.user = decoded;

        return next();

    } catch (err) {
        throw new AppError('Token inválido.', 401);
    }
};


export const checkRole = (roles: Array<'admin' | 'manager' | 'employee'>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError('Acesso negado. Permissão insuficiente.', 403);
        }
        return next();
    };
};