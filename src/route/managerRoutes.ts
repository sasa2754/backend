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

// Rota para o dashboard do funcionário específico
managerRouter.get('/employee/:id/dashboard', managerOnly, managerController.getEmployeeDashboard);

managerRouter.get('/team', managerOnly, managerController.getTeam);

managerRouter.get('/courses-status', managerOnly, managerController.getEmployeeCourseStatus);

export default managerRouter;