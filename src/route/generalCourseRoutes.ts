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

// Rota para ver o conteúdo de UMA aula específica
generalCourseRouter.get('/:courseId/lessons/:lessonId', authMiddleware, courseController.getLessonById);

// Rota para marcar uma aula como concluída
generalCourseRouter.post('/:courseId/lessons/:lessonId/complete', authMiddleware, courseController.markLessonAsComplete);

// Rota para submeter as respostas de um quiz
generalCourseRouter.post('/:courseId/lessons/:lessonId/submit-quiz', authMiddleware, courseController.submitQuiz);

export default generalCourseRouter;