import { Router } from 'express';

import { CompanyController } from '../controller/companyController.ts';
import { CompanyService } from '../service/companyService.ts';
import { authMiddleware, checkRole } from '../middleware/authMiddleware.ts';

const companyRouter = Router();

const companyService = new CompanyService();
const companyController = new CompanyController(companyService);

const adminOnly = [authMiddleware, checkRole(['admin'])];

companyRouter.route('/')
    .post(adminOnly, companyController.createCompany)
    .get(adminOnly, companyController.listCompanies);

companyRouter.route('/:companyId')
    .delete(adminOnly, companyController.deleteCompany);

export default companyRouter;