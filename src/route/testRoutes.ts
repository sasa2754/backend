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

// Rota para SUBMETER as respostas da prova (:id é o courseId)
testRouter.post('/:id/submit', authMiddleware, courseController.submitExam);

export default testRouter;