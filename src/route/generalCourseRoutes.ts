import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { CourseService } from '../service/courseService.ts';
import { CourseController } from '../controller/courseController.ts';

const generalCourseRouter = Router();

const courseService = new CourseService();
const courseController = new CourseController(courseService);


// Rota para LISTAR todos os cursos com filtros e paginação
generalCourseRouter.get('/', authMiddleware, courseController.listAll);

// Rota para ver detalhes de UM curso específico
generalCourseRouter.get('/:id', authMiddleware, courseController.getCourseDetailsById);

export default generalCourseRouter;