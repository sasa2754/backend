import mongoose from 'mongoose';
import Course from '../model/courseModel.ts';
import Exam from '../model/examModel.ts';
import { AppError } from '../error/AppError.ts';
import { CreateCourseRequestDTO, CreateExamRequestDTO } from '../dto/courseDto.ts';
import { ICourse } from '../interface/courseInterface.ts';

export class CourseService {


    public async createCourse(data: CreateCourseRequestDTO): Promise<ICourse> {

        const existingCourse = await Course.findOne({ title: data.title });
        if (existingCourse) {
            throw new AppError('Um curso com este título já existe.', 409);
        }


        const newCourse = await Course.create(data);
        return newCourse;
    }


    public async createExam(courseId: string, data: CreateExamRequestDTO): Promise<any> {
        const course: ICourse | null = await Course.findById(courseId);
        
        if (!course) {
            throw new AppError('Curso não encontrado.', 404);
        }

        if (!course.haveExam) {
            throw new AppError('Este curso não está configurado para ter uma prova.', 400);
        }

        if (course.exam) {
            throw new AppError('Este curso já possui uma prova cadastrada.', 409);
        }

        const newExam = await Exam.create({ ...data, course: courseId }) as { _id: mongoose.Types.ObjectId };

        course.exam = newExam._id;
        await course.save();
        
        return newExam;
    }


    public async deleteCourse(courseId: string): Promise<{ message: string }> {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new AppError('ID de curso inválido.', 400);
        }

        await Exam.deleteOne({ course: courseId });

        const deletedCourse = await Course.findByIdAndDelete(courseId);

        if (!deletedCourse) {
            throw new AppError('Curso não encontrado.', 404);
        }

        return { message: "Course deleted successfully" };
    }
}