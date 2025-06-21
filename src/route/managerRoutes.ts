import { Router } from 'express';
import { authMiddleware, checkRole } from '../middleware/authMiddleware.ts';
import { ManagerService } from '../service/managerService.ts';
import { ManagerController } from '../controller/managerController.ts';

const managerRouter = Router();

const managerService = new ManagerService();
const managerController = new ManagerController(managerService);

const managerOnly = [authMiddleware, checkRole(['manager'])];

// Rota para inscrever um funcionário
managerRouter.post('/enroll', managerOnly, managerController.enrollEmployee);

// Rota para o dashboard do manager
managerRouter.get('/dashboard', managerOnly, managerController.getDashboard);

// Rota para o sumário da equipe
managerRouter.get('/employeesSummary', managerOnly, managerController.getEmployeesSummary);

export default managerRouter;