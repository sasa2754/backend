import { Router } from 'express';
import { authMiddleware, checkRole } from '../middleware/authMiddleware.ts';
import { CourseService } from '../service/courseService.ts';
import { CourseController } from '../controller/courseController.ts';

const adminCourseRouter = Router();

const courseService = new CourseService();
const courseController = new CourseController(courseService);

const adminOnly = [authMiddleware, checkRole(['admin'])];

adminCourseRouter.post('/', adminOnly, courseController.createCourse);

adminCourseRouter.post('/:courseId/exam', adminOnly, courseController.createExam);

adminCourseRouter.delete('/:courseId', adminOnly, courseController.deleteCourse);

export default adminCourseRouter;