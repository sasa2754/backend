import User from '../model/userModel.ts';
import Course from '../model/courseModel.ts';
import { AppError } from '../error/AppError.ts';
import { IUser } from '../interface/userInterface.ts';
import companyModel from '../model/companyModel.ts';

export class HomeService {
    /**
     * Busca e calcula os dados de progresso para a tela inicial do usuário logado.
     * @param userId O ID do usuário logado.
     */
    public async getPersonalProgress(userId: string): Promise<any> {
        const user = await User.findById(userId).lean();

        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const ongoingCourses = user.coursesInProgress?.length || 0;
        const completedCourses = user.completedCoursesList?.length || 0;
        let percenteGeneral = 0;

        if (ongoingCourses > 0 && user.coursesInProgress) {
            const sumOfProgress = user.coursesInProgress.reduce((sum, course) => sum + course.progress, 0);
            percenteGeneral = Math.round(sumOfProgress / ongoingCourses);
        } else if (completedCourses > 0) {
            percenteGeneral = 100;
        }

        // Monta a resposta focada nos dados de um aluno/usuário individual
        const response = {
            username: user.name,
            isManager: user.role === 'manager',
            totalCourses: ongoingCourses + completedCourses,
            ongoingCourses: ongoingCourses,
            completeCourses: completedCourses,
            percenteGeneral: percenteGeneral,
        };

        return response;
    }

    public async getCoursesInProgress(userId: string): Promise<any> {
    const user = await User.findById(userId)
        .populate({
            path: 'coursesInProgress.courseId',
            select: 'title image description difficulty category' // Campos que queremos do curso
        })
        .lean();

    if (!user) {
        throw new AppError('Usuário não encontrado.', 404);
    }
    
    // Mapeia para o formato da resposta da API
    const courses = user.coursesInProgress?.map((progressInfo: any) => ({
        id: progressInfo.courseId._id.toString(),
        title: progressInfo.courseId.title,
        image: progressInfo.courseId.image,
        progress: progressInfo.progress,
        description: progressInfo.courseId.description,
        difficulty: progressInfo.courseId.difficulty,
        category: progressInfo.courseId.category,
        rating: 4.8, // Estes são dados estáticos no seu exemplo, podemos ajustar
        participants: 157
    })) || [];
    
    // Retorna apenas os 8 primeiros, como na sua documentação
    return courses.slice(0, 8);
}
}