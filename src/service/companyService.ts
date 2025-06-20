import mongoose from 'mongoose';
import Company from '../model/companyModel.ts';
import User from '../model/userModel.ts';
import { AppError } from '../error/AppError.ts';
import { 
    CreateCompanyRequestDTO, 
    CreateCompanyResponseDTO, 
    CompanyResponseDTO, 
    DeleteCompanyResponseDTO 
} from '../dto/companyDto.ts';

export class CompanyService {
    
    // Método para CRIAR uma empresa
    public async createCompany(data: CreateCompanyRequestDTO): Promise<CreateCompanyResponseDTO> {
        const existingCompany = await Company.findOne({ name: data.name });
        if (existingCompany) {
            throw new AppError('Uma empresa com este nome já existe.', 409);
        }

        const newCompany = await Company.create({ name: data.name }) as { _id: mongoose.Types.ObjectId };

        return {
            message: "Company created successfully",
            companyId: newCompany._id.toString()
        };
    }

    // Método para LISTAR todas as empresas
    public async listCompanies(): Promise<CompanyResponseDTO[]> {
        const companies = await Company.find({}).sort({ name: 1 }).lean();

        const response = companies.map(company => ({
            id: company._id.toString(),
            name: company.name
        }));

        return response;
    }

    // Método para DELETAR uma empresa e seus funcionários
    public async deleteCompany(companyId: string): Promise<DeleteCompanyResponseDTO> {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new AppError('ID de empresa inválido.', 400);
        }
        
        await User.deleteMany({ company: companyId });

        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            throw new AppError('Empresa não encontrada.', 404);
        }

        return { message: "Company and related employees deleted successfully" };
    }
}