import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { HomeController } from '../controller/homeController.ts';
import { HomeService } from '../service/homeService.ts';

const homeRouter = Router();

const homeService = new HomeService();
const homeController = new HomeController(homeService);

homeRouter.get('/progress', authMiddleware, homeController.getProgress);

homeRouter.get('/coursesInProgress', authMiddleware, homeController.getCoursesInProgress);


export default homeRouter;