import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { CourseController } from '../controller/courseController.ts';
import { CourseService } from '../service/courseService.ts';

const testRouter = Router();

// Reutilizamos o CourseController/Service pois a lógica está relacionada
const courseService = new CourseService();
const courseController = new CourseController(courseService);

// A rota espera o ID do CURSO na URL
testRouter.get('/:id', authMiddleware, courseController.getExam);

export default testRouter;