import bcrypt from 'bcrypt';
import User from '../model/userModel.ts';
import Company from '../model/companyModel.ts';
import { AppError } from '../error/AppError.ts';
import { CreateUserRequestDTO } from '../dto/userDto.ts';
import { sendWelcomeEmail } from './emailService.ts';

export class UserService {
    public async createUser(
        data: CreateUserRequestDTO, 
        creatorRole: 'admin' | 'manager',
        creatorCompanyId?: string | null,
        creatorId?: string
    ): Promise<{ success: boolean; message: string }> {

        const existingUser = await User.findOne({ 
            $or: [{ email: data.email }, { employeeId: data.employeeId }]
        });
        if (existingUser) {
            throw new AppError('E-mail ou ID de funcionário já cadastrado.', 409);
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        let targetCompanyId: string | null = null;
        let role: 'manager' | 'employee';

        if (creatorRole === 'admin') {
            if (!data.companyId) {
                throw new AppError('Admin deve especificar o companyId para criar um usuário.', 400);
            }
            const companyExists = await Company.findById(data.companyId);
            if (!companyExists) {
                throw new AppError('A empresa especificada não foi encontrada.', 404);
            }
            targetCompanyId = data.companyId;
            role = 'manager';
        } else { // é manager
            if (!creatorCompanyId) {
                throw new AppError('Manager não tem uma empresa associada.', 400);
            }
            targetCompanyId = creatorCompanyId;
            role = data.isManager ? 'manager' : 'employee';
        }
        
        const newUser : any = {
            employeeId: data.employeeId,
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: role,
            firstAccess: true,
            company: targetCompanyId,
        };

        if (creatorRole === 'manager') {
            newUser.manager = creatorId;
        }

        await User.create(newUser);

        await sendWelcomeEmail(data.email, tempPassword);
        return { success: true, message: 'Usuário criado com sucesso. Um e-mail com a senha temporária foi enviado.' };
    }
}