import { Request, Response } from 'express';
import { CourseService } from '../service/courseService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request {
    user?: {
        sub: string;
        role: 'admin' | 'manager' | 'employee';
        company?: string | null;
    };
}

export class CourseController {
    constructor(private courseService: CourseService) {}

    private handleError(error: unknown, res: Response, context: string) {
        if (error instanceof AppError) {
            return res.json({ message: error.message });
        }
        console.error(`ERRO INESPERADO EM ${context}:`, error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }

    // Lógica para criar um curso
    public createCourse = async (req: Request, res: Response) => {
        try {
            const newCourse = await this.courseService.createCourse(req.body);
            res.status(201).json(newCourse);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO CRIAR CURSO:", error);
            res.status(500).json({ message: 'Erro interno ao criar curso.' });
        }
    };

    // Lógica para criar uma prova para um curso
    public createExam = async (req: Request, res: Response) => {
        try {
            const newExam = await this.courseService.createExam(req.params.courseId, req.body);
            res.status(201).json(newExam);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO CRIAR PROVA:", error);
            res.status(500).json({ message: 'Erro interno ao criar prova.' });
        }
    };

    // Lógica para deletar um curso
    public deleteCourse = async (req: Request, res: Response) => {
        try {
            const result = await this.courseService.deleteCourse(req.params.courseId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO DELETAR CURSO:", error);
            res.status(500).json({ message: 'Erro interno ao deletar curso.' });
        }
    };

    public listAll = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }
            
            const filters = {
                page: req.query.page ? Number(req.query.page) : undefined,
                search: req.query.search as string | undefined,
                category: req.query.category as string | undefined,
                difficulty: req.query.difficulty ? Number(req.query.difficulty) : undefined,
            };

            const result = await this.courseService.findAll(userId, filters);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.json({ message: error.message });
            }
            console.error("ERRO AO LISTAR CURSOS:", error);
            res.status(500).json({ message: 'Erro interno ao listar cursos.' });
        }
    };

    public getCourseDetailsById = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }

            const { id } = req.params;

            const result = await this.courseService.findCourseDetailsById(id, userId);
            res.status(200).json(result);
        } catch (error) {
            console.log("ERRO AO PEGAR OS DETALHES DO CURSO:", error);
            throw new AppError("Erro interno do servidor!", 500);
        }
    };

    public getLessonById = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                throw new AppError('Usuário não autenticado.', 401);
            }

            const { courseId, lessonId } = req.params; 

            const result = await this.courseService.findLessonById(courseId, lessonId, userId);
            res.status(200).json(result);
        } catch (error) {
            console.log("ERRO AO PEGAR AS LIÇÕES DO CURSO:", error);
            throw new AppError("Erro interno do servidor!", 500);
        }
    };

    public markLessonAsComplete = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            const { courseId, lessonId } = req.params;
            const result = await this.courseService.markLessonAsComplete(userId, courseId, lessonId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, 'MARK_LESSON_COMPLETE');
        }
    };

    public submitQuiz = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            const { courseId, lessonId } = req.params;
            const result = await this.courseService.submitQuiz(userId, courseId, lessonId, req.body);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, 'SUBMIT_QUIZ');
        }
    };
    
    public getExam = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            const { id: courseId } = req.params;
            const result = await this.courseService.getExamForCourse(userId, courseId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, 'GET_EXAM');
        }
    };

     public submitExam = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            
            const { id: courseId } = req.params;

            const result = await this.courseService.submitExam(userId, courseId, req.body);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res, 'SUBMIT_EXAM');
        }
    };
}