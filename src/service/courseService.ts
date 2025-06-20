import mongoose from 'mongoose';
import Course from '../model/courseModel.ts';
import Exam from '../model/examModel.ts';
import { AppError } from '../error/AppError.ts';
import { CreateCourseRequestDTO, CreateExamRequestDTO } from '../dto/courseDto.ts';
import { ICourse } from '../interface/courseInterface.ts';
import userModel from '../model/userModel.ts';

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

    public async findAll(userId: string, filters: { page?: number, search?: string, category?: string, difficulty?: number }) {
        const page = filters.page || 1;
        const limit = 12;
        const skip = (page - 1) * limit;


        const queryFilter: any = { isActive: true };

        if (filters.search) {
            queryFilter.title = { $regex: new RegExp(filters.search, 'i') };
        }
        if (filters.category) {
            queryFilter.category = filters.category;
        }
        if (filters.difficulty) {
            queryFilter.difficulty = filters.difficulty;
        }

        const totalCourses = await Course.countDocuments(queryFilter);
        const totalPages = Math.ceil(totalCourses / limit);

        const courses = await Course.find(queryFilter)
            .sort({ title: 1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const user = await userModel.findById(userId).select('coursesInProgress').lean();
        const progressMap = new Map();
        if (user && user.coursesInProgress) {
            user.coursesInProgress.forEach((course: any) => {

                progressMap.set(course.id.toString(), course.progress);
            });
        }

        const coursesWithProgress = courses.map(course => ({
            id: course._id.toString(),
            title: course.title,
            image: course.image,
            description: course.description,
            difficulty: course.difficulty,
            category: course.category,
            progress: progressMap.get(course._id.toString()) || 0,
        }));

        return {
            currentPage: page,
            totalPages,
            courses: coursesWithProgress
        };
    }

    public async findCourseDetailsById(courseId: string, userId: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new AppError('ID de curso inválido.', 400);
        }

        const coursePromise = Course.findById(courseId).lean();
        const userPromise = userModel.findById(userId).select('coursesInProgress').lean();
        
        const [course, user] = await Promise.all([coursePromise, userPromise]);

        if (!course) {
            throw new AppError('Curso não encontrado.', 404);
        }

        const userCourseProgress = user?.coursesInProgress?.find(
            (p: any) => p.courseId.toString() === courseId
        );
        
        const completedContentSet = new Set(
            userCourseProgress?.completedContent?.map((c: any) => c.contentId.toString()) || []
        );

        // 5. Transformar os dados para o formato da resposta da API
        const responseModules = course.modules.map(module => ({
            id: module._id.toString(),
            title: module.title,
            description: module.description,
            content: module.content.map((contentItem: any) => ({
                id: contentItem._id.toString(),
                type: contentItem.type,
                title: contentItem.title,
                // Verificamos no Set se o ID deste conteúdo foi completado pelo usuário
                completed: completedContentSet.has(contentItem._id.toString())
            }))
        }));

        // 6. Montar o objeto de resposta final
        const response = {
            id: course._id.toString(),
            title: course.title,
            image: course.image,
            description: course.description,
            // rating, participants, etc., podem ser adicionados aqui
            progress: userCourseProgress?.progress || 0,
            difficulty: course.difficulty,
            duration: course.duration,
            category: course.category,
            haveExam: course.haveExam,
            modules: responseModules,
        };

        return response;
    }
}