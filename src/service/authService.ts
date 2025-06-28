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
  SetInitialPasswordRequestDTO,
  SetInitialPasswordResponseDTO,
} from '../dto/authDto.ts';

import User from '../model/userModel.ts'

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../error/AppError.ts';
import { sendPasswordResetEmail } from './emailService.ts';

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

    const token = jwt.sign({ sub: user._id, name: user.name, email: user.email, role: user.role, company: user.company }, jwtSecret, { expiresIn: '8h' });

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
      
      console.log(`Código para ${user.email}: ${code}`);
      await sendPasswordResetEmail(user.email, code);
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

  public async setInitialPassword(
        data: SetInitialPasswordRequestDTO, 
        userId: string
    ): Promise<SetInitialPasswordResponseDTO> {
        
        // 1. Buscar o usuário pelo ID e incluir a senha para comparação
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // 2. VERIFICAÇÃO CRUCIAL: Este endpoint só pode ser usado se for o primeiro acesso.
        if (!user.firstAccess) {
            throw new AppError('Esta ação não é permitida. A senha já foi definida.', 403); // 403 Forbidden
        }

        // 3. Validar se a senha atual (temporária) está correta
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('A senha atual está incorreta.', 401); // 401 Unauthorized
        }

        // 4. Criptografar a nova senha
        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

        // 5. Atualizar o documento do usuário
        user.password = newPasswordHash;
        user.firstAccess = false; // <-- A MÁGICA ACONTECE AQUI!
        await user.save();

        return { message: 'Senha definida com sucesso.' };
    }
}