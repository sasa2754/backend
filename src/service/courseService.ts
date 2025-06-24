import mongoose from 'mongoose';
import Course from '../model/courseModel.ts';
import Exam from '../model/examModel.ts';
import { AppError } from '../error/AppError.ts';
import { CreateCourseRequestDTO, CreateExamRequestDTO, SubmitQuizRequestDTO, SubmitQuizResponseDTO } from '../dto/courseDto.ts';
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
        const progressMap = new Map(
            user?.coursesInProgress?.map((p: any) => [p.courseId.toString(), p.progress]) || []
        );

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

    public async findLessonById(courseId: string, lessonId: string, userId: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
            throw new AppError('ID de curso ou aula inválido.', 400);
        }
        
        const coursePromise = Course.findById(courseId).lean();
        const userPromise = userModel.findById(userId).select('coursesInProgress').lean();
        const [course, user] = await Promise.all([coursePromise, userPromise]);

        if (!course) {
            throw new AppError('Curso não encontrado.', 404);
        }

        let targetLesson: any = null;
        let parentModule: any = null;
        let moduleIndex = -1;
        let lessonIndex = -1;

        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];
            const foundIndex = module.content.findIndex((c: any) => c._id.toString() === lessonId);
            
            if (foundIndex !== -1) {
                targetLesson = module.content[foundIndex];
                parentModule = module;
                moduleIndex = i;
                lessonIndex = foundIndex;
                break;
            }
        }

        if (!targetLesson) {
            throw new AppError('Aula ou atividade não encontrada neste curso.', 404);
        }

        let nextLesson: any = false;
        if (lessonIndex + 1 < parentModule.content.length) {
            const nextContent = parentModule.content[lessonIndex + 1];
            nextLesson = { id: nextContent._id.toString(), type: nextContent.type, title: nextContent.title };
        } 
        else if (moduleIndex + 1 < course.modules.length) {
            const nextModule = course.modules[moduleIndex + 1];
            if (nextModule.content && nextModule.content.length > 0) {
                const nextContent = nextModule.content[0];
                nextLesson = { id: nextContent._id.toString(), type: nextContent.type, title: nextContent.title };
            }
        }
        
        const userCourseProgress = user?.coursesInProgress?.find(
            (p: any) => p.courseId.toString() === courseId
        );
        const completedContentSet = new Set(
            userCourseProgress?.completedContent?.map((c: any) => c.contentId.toString()) || []
        );

        const response = {
            ...targetLesson,
            id: targetLesson._id.toString(),
            courseId: course._id.toString(),
            completed: completedContentSet.has(targetLesson._id.toString()),
            nextLesson: nextLesson
        };
        
        delete response._id;

        return response;
    }

    public async markLessonAsComplete(userId: string, courseId: string, lessonId: string) {
        const course = await Course.findById(courseId).lean();
        const user = await userModel.findById(userId);

        if (!user) throw new AppError('Usuário não encontrado.', 404);
        if (!course) throw new AppError('Curso não encontrado.', 404);

        const courseProgress = user.coursesInProgress?.find(p => p.courseId.toString() === courseId);

        if (!courseProgress) {
            throw new AppError('Usuário não está inscrito neste curso.', 403);
        }

        const isAlreadyCompleted = courseProgress.completedContent.some(
            c => c.contentId.toString() === lessonId
        );

        if (isAlreadyCompleted) {
            return { message: "Aula já estava marcada como concluída.", newProgress: courseProgress.progress };
        }

        courseProgress.completedContent.push({ contentId: new mongoose.Types.ObjectId(lessonId) });

        const totalContentItems = course.modules.reduce((sum, module) => sum + module.content.length, 0);
        const completedCount = courseProgress.completedContent.length;

        if (totalContentItems > 0) {
            courseProgress.progress = Math.round((completedCount / totalContentItems) * 100);
        }

        await user.save();

        return { 
            message: "Aula marcada como concluída com sucesso!", 
            newProgress: courseProgress.progress 
        };
    }

    public async submitQuiz(
        userId: string, 
        courseId: string, 
        lessonId: string, 
        submission: SubmitQuizRequestDTO
    ): Promise<SubmitQuizResponseDTO> {
        
        const user = await userModel.findById(userId);
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const courseProgress = user.coursesInProgress?.find(p => p.courseId.toString() === courseId);
        if (!courseProgress) throw new AppError('Usuário não está inscrito neste curso.', 403);
        
        const isAlreadyCompleted = courseProgress.completedContent.some(c => c.contentId.toString() === lessonId);
        if (isAlreadyCompleted) throw new AppError('Esta atividade já foi concluída.', 409);

        const course = await Course.findOne({ "modules.content._id": lessonId }).lean();
        if (!course) throw new AppError('Atividade não encontrada.', 404);

        let quizActivity: any;
        course.modules.forEach(m => {
            const found = m.content.find((c: any) => c._id.toString() === lessonId);
            if (found) quizActivity = found;
        });

        if (!quizActivity || quizActivity.type !== 3) {
            throw new AppError('O conteúdo encontrado não é uma atividade de múltipla escolha.', 400);
        }

        let correctCount = 0;
        const totalQuestions = quizActivity.questions.length;

        const correctAnswersMap = new Map(quizActivity.questions.map((q: any) => [q.id, q.correctOptionId]));

        submission.answers.forEach(answer => {
            if (correctAnswersMap.get(answer.questionId) === answer.selectedOptionId) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        courseProgress.completedContent.push({ 
            contentId: new mongoose.Types.ObjectId(lessonId),
            score: score
        });

        const totalContentItems = course.modules.reduce((sum, module) => sum + module.content.length, 0);
        courseProgress.progress = Math.round((courseProgress.completedContent.length / totalContentItems) * 100);
        
        await user.save();

        return {
            message: "Atividade enviada com sucesso!",
            score: score,
            correctAnswers: correctCount,
            totalQuestions: totalQuestions,
            newProgress: courseProgress.progress
        };
    }

    public async getExamForCourse(userId: string, courseId: string): Promise<any> {
        // 1. Validações iniciais
        const user = await userModel.findById(userId).lean();
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const course = await Course.findById(courseId).lean();
        if (!course) throw new AppError('Curso não encontrado.', 404);

        // 2. Validação de segurança: O usuário está inscrito neste curso?
        const isEnrolled = user.coursesInProgress?.some(p => p.courseId.toString() === courseId) || 
                           user.completedCoursesList?.some(c => c.courseId.toString() === courseId);
        if (!isEnrolled) {
            throw new AppError('Você não tem permissão para acessar esta prova, pois não está inscrito no curso.', 403);
        }

        // 3. Validação de negócio: O curso realmente tem uma prova e ela já foi criada?
        if (!course.haveExam || !course.exam) {
            throw new AppError('Este curso não possui uma prova final disponível.', 404);
        }

        // 4. Buscar os dados da prova
        const exam = await Exam.findById(course.exam).lean();
        if (!exam) {
            throw new AppError('Prova não encontrada.', 404);
        }

        // 5. Formatar a resposta, REMOVENDO as respostas corretas
        const questionsForFrontend = exam.questions.map((q: any) => {
            // Criamos um novo objeto sem o campo 'correctOptionId'
            const { correctOptionId, ...questionData } = q;
            return questionData;
        });

        // 6. Montar o objeto de resposta final
        return {
            id: exam._id.toString(),
            title: exam.title,
            courseId: course._id.toString(),
            completed: false, // O frontend pode usar a lista de progresso do usuário para verificar isso
            content: questionsForFrontend // 'content' como na sua documentação
        };
    }
}