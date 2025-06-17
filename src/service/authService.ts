import {
  AuthLoginRequestDTO,
  AuthLoginResponseDTO,
  AuthForgotPassRequestDTO,
  AuthForgotPassResponseDTO,
  AuthCheckCodeRequestDTO,
  AuthCheckCodeResponseDTO,
  AuthResendCodeRequestDTO,
  AuthResendCodeResponseDTO,
  AuthResetPasswordRequestDTO,
  AuthResetPasswordResponseDTO,
} from '../dto/authDto.ts';

import User from '../model/userModel.ts'

import bcrypt from 'bcrypt';
import { generateToken } from '../utils/tokenUtil.ts';
import jwt from 'jsonwebtoken';
import { AppError } from '../error/AppError.ts';

// Armazenamento em memória para os códigos de recuperação
const passwordResetStore = new Map<string, { code: string; expiresAt: Date }>();

export class AuthService {

  public async login(data: AuthLoginRequestDTO): Promise<AuthLoginResponseDTO> {
    // Buscar o usuário pelo e-mail e incluir o campo password na busca
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Usuário ou senha inválidos.', 401);
    }

    // Gerar o token JWT
    const jwtSecret = process.env.SECRET;
    if (!jwtSecret) {
      throw new AppError('SECRET não definida nas variáveis de ambiente.', 500);
    }

    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '8h' });

    return {
      token,
      firstAccess: user.firstAccess,
    };
  }

  public async forgotPassword(data: AuthForgotPassRequestDTO): Promise<AuthForgotPassResponseDTO> {
    const user = await User.findOne({ email: data.email });

    if (user) {
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Válido por 10 minutos

      // Salvado o código do usuário
      passwordResetStore.set(user.email, { code, expiresAt });

      // Lógica para enviar o e-mail (tenho que pensar em algo ainda aaaaaaaaaaaaaa)
      console.log(`Código para ${user.email}: ${code}`);
    }
    
    return { response: true };
  }

  public async checkCode(data: AuthCheckCodeRequestDTO): Promise<AuthCheckCodeResponseDTO> {
    const storedData = passwordResetStore.get(data.email);

    if (storedData && storedData.code === data.code && storedData.expiresAt > new Date()) {
      // Opcional, mas recomendado: não remova o código aqui.
      // Deixe o código válido até que a senha seja redefinida ou ele expire.
      // Isso permite que o usuário prossiga para a tela de redefinição de senha.
      return { response: true };
    }

    return { response: false };
  }

  public async resendCode(data: AuthForgotPassRequestDTO): Promise<AuthForgotPassResponseDTO> {
    return this.forgotPassword(data);
  }

  public async resetPassword(data: AuthResetPasswordRequestDTO): Promise<AuthResetPasswordResponseDTO> {
    // Verificar se o código fornecido é válido (revalidação de segurança)
    const storedData = passwordResetStore.get(data.email);
    
    if (!storedData || storedData.code !== data.code || storedData.expiresAt <= new Date()) {
        throw new AppError('Código de verificação inválido ou expirado.', 400);
    }

    // Criptografar a nova senha
    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    // Atualizar a senha do usuário no banco de dados
    const updatedUser = await User.findOneAndUpdate(
      { email: data.email },
      {
        $set: {
          password: newPasswordHash,
          firstAccess: false,
        },
      }
    );

    if (!updatedUser) {
      throw new AppError('Não foi possível redefinir a senha. Usuário não encontrado.', 404);
    }

    // IMPORTANTE: Remover o código do store para que não possa ser reutilizado
    passwordResetStore.delete(data.email);

    return { response: true };
  }
}