import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../error/AppError.ts';

const SECRET = process.env.SECRET;

export function generateToken(payload: object): string {
  if (!SECRET)
    throw new AppError("SECRET não definida", 500);

  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): object | null {
  try {
    if (!SECRET)
      throw new AppError("SECRET não definida", 500);
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
