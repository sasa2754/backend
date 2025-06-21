import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import upload from '../../config/multer.ts';
import { ActivityController } from '../controller/activityController.ts';
import { ActivityService } from '../service/activityService.ts';

const activityRouter = Router();

// Instanciando as classes necessárias
const activityService = new ActivityService();
const activityController = new ActivityController(activityService);

/**
 * Define a rota para upload de PDF de uma atividade.
 * A ordem dos middlewares é CRUCIAL aqui.
 */
activityRouter.post('/:courseId/lessons/:lessonId/upload', authMiddleware, upload.single('pdfFile'), activityController.submitPdf);

export default activityRouter;