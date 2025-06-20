import { Router } from 'express';
import { authMiddleware, checkRole } from '../middleware/authMiddleware.ts';
import { CourseService } from '../service/courseService.ts';
import { CourseController } from '../controller/courseController.ts';

const courseRouter = Router();

const courseService = new CourseService();
const courseController = new CourseController(courseService);

const adminOnly = [authMiddleware, checkRole(['admin'])];


courseRouter.route('/')
    .post(adminOnly, courseController.createCourse);
    // .get(...) futuramente

courseRouter.route('/:courseId/exam')
    .post(adminOnly, courseController.createExam);

courseRouter.route('/:courseId')
    .delete(adminOnly, courseController.deleteCourse);

export default courseRouter;