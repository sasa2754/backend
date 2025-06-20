import { Request, Response } from 'express';
import { CourseService } from '../service/courseService.ts';
import { AppError } from '../error/AppError.ts';

export class CourseController {
    constructor(private courseService: CourseService) {}

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

    // Futuramente, você adicionaria aqui o método listCourses, getCourseById, etc.
}