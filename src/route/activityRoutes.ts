import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { ActivityController } from '../controller/activityController.ts';
import { ActivityService } from '../service/activityService.ts';
import { pdfUpload } from '../../config/multer.ts';

const activityRouter = Router();

// Instanciando as classes necessárias
const activityService = new ActivityService();
const activityController = new ActivityController(activityService);

/**
 * Define a rota para upload de PDF de uma atividade.
 * A ordem dos middlewares é CRUCIAL aqui.
 */
activityRouter.post('/:courseId/lessons/:lessonId/upload', authMiddleware, pdfUpload.single('pdfFile'), activityController.submitPdf);

export default activityRouter;