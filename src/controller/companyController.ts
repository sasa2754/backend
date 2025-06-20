import { Request, Response } from 'express';
import { CompanyService } from '../service/companyService.ts';
import { AppError } from '../error/AppError.ts';
import { CreateCompanyRequestDTO } from '../dto/companyDto.ts';
import companyModel from '../model/companyModel.ts';

export class CompanyController {
    constructor(private companyService: CompanyService) {}

    public createCompany = async (req: Request, res: Response) => {
        try {
            const result = await this.companyService.createCompany(req.body);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    public listCompanies = async (req: Request, res: Response) => {
        try {
            const result = await this.companyService.listCompanies();
            res.status(200).json({ companies: result });
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    public deleteCompany = async (req: Request, res: Response) => {
        try {
            const { companyId } = req.params;
            const result = await this.companyService.deleteCompany(companyId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}