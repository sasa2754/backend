import User from '../model/userModel.ts';
import Course from '../model/courseModel.ts';
import { AppError } from '../error/AppError.ts';
import { NotificationService } from './notificationService.ts';
import { ICompletedContent, IUser } from '../interface/userInterface.ts';
import mongoose from 'mongoose';

export class ManagerService {

    private notificationService = new NotificationService();

    public async enrollEmployeeInCourse(
        managerId: string, 
        managerCompanyId: string, 
        data: { employeeId: string, courseId: string }
    ): Promise<{ message: string }> {

        const course = await Course.findById(data.courseId).lean();

        const employee: IUser | null = await User.findById(data.employeeId);

        if (!course) {
            throw new AppError('Curso não encontrado.', 404);
        }
        if (!employee) {
            throw new AppError('Funcionário não encontrado.', 404);
        }
        
        if (employee.company?.toString() !== managerCompanyId) {
            throw new AppError('Você só pode inscrever funcionários da sua própria empresa.', 403);
        }

        const isAlreadyEnrolled = employee.coursesInProgress?.some(
            p => p.courseId.toString() === data.courseId
        );
        if (isAlreadyEnrolled) {
            throw new AppError('Este funcionário já está inscrito neste curso.', 409);
        }
        
        employee.coursesInProgress?.push({
            courseId: course._id.toString(),
            progress: 0,
            completedContent: [] as ICompletedContent[]
        });

        await employee.save();

        const notificationMessage = `Você foi inscrito no curso "${course.title}" pelo seu gestor.`;
        const notificationLink = `/courses/${course._id.toString()}`;
        
        await this.notificationService.createNotification(employee.id, notificationMessage, notificationLink);

        return { message: "Funcionário inscrito com sucesso!" };
    }

    public async getDashboardData(managerId: string): Promise<any> {
        const managerObjectId = new mongoose.Types.ObjectId(managerId);

        // 1. Contagens Simples
        const totalEmployees = await User.countDocuments({ manager: managerObjectId });
        const totalCoursesOnPlatform = await Course.countDocuments({ isActive: true });
        const manager = await User.findById(managerId).lean();
        if (!manager) throw new AppError("Manager não encontrado.", 404);

        // 2. O Pipeline de Agregação para calcular as métricas complexas
        const aggregationResult = await User.aggregate([
            // Estágio 1: Encontrar apenas os funcionários da equipe deste manager
            { $match: { manager: managerObjectId } },
            
            // Estágio 2: "Desdobrar" o array de cursos em progresso para processar um por um
            { $unwind: '$coursesInProgress' },
            
            // Estágio 3: Fazer um "join" com a coleção de Cursos para pegar a categoria
            {
                $lookup: {
                    from: 'courses', // O nome da coleção de cursos no MongoDB (geralmente em minúsculo e no plural)
                    localField: 'coursesInProgress.courseId',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            
            // Estágio 4: "Desdobrar" o resultado do lookup
            { $unwind: '$courseDetails' },
            
            // Estágio 5: Agrupar tudo para fazer os cálculos
            {
                $group: {
                    _id: null, // Agrupar todos os resultados em um único documento
                    totalEnrollmentsInProgress: { $sum: 1 }, // Conta cada curso em progresso
                    totalCompletionProgress: { $sum: '$coursesInProgress.progress' }, // Soma todas as porcentagens de progresso
                    performanceByCategory: {
                        $push: { // Cria um array com categoria e média de nota do curso
                            category: '$courseDetails.category',
                            score: { $avg: '$coursesInProgress.completedContent.score' }
                        }
                    }
                }
            }
        ]);
        
        // Contando cursos concluídos separadamente, pois a agregação fica mais simples assim
        const completedCoursesResult = await User.aggregate([
            { $match: { manager: managerObjectId } },
            { $unwind: '$completedCoursesList' },
            { $group: { _id: null, total: { $sum: 1 } } }
        ]);

        const totalCompleted = completedCoursesResult[0]?.total || 0;
        const aggregationData = aggregationResult[0] || {};
        
        const totalInProgress = aggregationData.totalEnrollmentsInProgress || 0;
        const totalEnrollments = totalInProgress + totalCompleted;
        
        // Soma o progresso dos cursos em andamento (ex: 50% + 70%) + o progresso dos concluídos (100% cada)
        const sumOfProgress = (aggregationData.totalCompletionProgress || 0) + (totalCompleted * 100);
        const completionRate = totalEnrollments > 0 ? Math.round(sumOfProgress / totalEnrollments) : 0;
        
        // Simplificação do performanceByCategory (a lógica completa pode ser mais complexa)
        // Aqui apenas pegamos os dados crus da agregação.
        const performanceByCategory = aggregationData.performanceByCategory || [];

        return {
            username: manager.name,
            isManager: true,
            isAdmin: false,
            totalEmployees: totalEmployees,
            totalCourses: totalCoursesOnPlatform,
            totalRegistrations: totalEnrollments,
            completionRate: completionRate,
            performanceByCategory: performanceByCategory, // Dados brutos da agregação
            courseStatus: {
              completed: totalCompleted,
              inProgress: totalInProgress,
              notStarted: totalEnrollments - (totalInProgress + totalCompleted) // Este cálculo pode precisar de refinamento
            }
        };
    }

    public async getEmployeesSummary(managerId: string): Promise<any[]> {
        // 1. Encontrar todos os funcionários que são gerenciados por este manager.
        // Usamos .lean() para performance, já que é uma operação de leitura intensiva.
        const team = await User.find({ manager: managerId }).lean();

        // 2. Mapear cada funcionário para o formato de resumo da DTO.
        // Usamos Promise.all para processar todos os funcionários em paralelo, se necessário no futuro.
        const summaryData = await Promise.all(
            team.map(async (employee) => {
                // 3. Calcular a média das notas (averageScore)
                let totalScore = 0;
                let scoredActivities = 0;

                employee.coursesInProgress?.forEach(course => {
                    course.completedContent?.forEach(content => {
                        if (typeof content.score === 'number') {
                            totalScore += content.score;
                            scoredActivities++;
                        }
                    });
                });

                const averageScore = scoredActivities > 0 ? Math.round(totalScore / scoredActivities) : 0;
                
                // 4. Calcular a categoria de melhor desempenho (topCategory)
                // Esta é uma lógica mais complexa. Por enquanto, vamos deixar um valor padrão.
                // Implementaremos isso depois, se necessário.
                const topCategory = "A definir";

                // 5. Montar o objeto de retorno para este funcionário
                return {
                    id: employee._id.toString(),
                    name: employee.name,
                    email: employee.email,
                    coursesCompleted: employee.completedCoursesList?.length || 0,
                    coursesInProgress: employee.coursesInProgress?.length || 0,
                    averageScore: averageScore,
                    topCategory: topCategory,
                    isManager: employee.role === 'manager'
                };
            })
        );

        return summaryData;
    }

    public async getEmployeeDashboard(managerId: string, employeeId: string): Promise<any> {
        // 1. Busca o funcionário e popula os dados dos cursos referenciados
        const employee = await User.findById(employeeId)
            .populate({
                path: 'coursesInProgress.courseId',
                select: 'title category difficulty image' // Popula os cursos em progresso
            })
            .populate({
                path: 'completedCoursesList.courseId',
                select: 'title category difficulty image' // Popula os cursos concluídos
            })
            .lean();

        // 2. VALIDAÇÃO DE SEGURANÇA: Garante que o funcionário pertence à equipe do manager.
        if (!employee || employee.manager?.toString() !== managerId) {
            throw new AppError('Funcionário não encontrado ou não pertence à sua equipe.', 404);
        }

        const allPlatformCourses = await Course.find({ isActive: true }).lean();
    
        const completedIds = new Set(employee.completedCoursesList?.map((c: any) => c.courseId._id.toString()));
        const inProgressIds = new Set(employee.coursesInProgress?.map((c: any) => c.courseId._id.toString()));

        const notStarted = allPlatformCourses.filter(course => {
            const courseIdStr = course._id.toString();
            return !completedIds.has(courseIdStr) && !inProgressIds.has(courseIdStr);
        });

        // 3. Calcular Média Geral (reaproveitando a lógica)
        let totalScore = 0;
        let scoredActivities = 0;
        employee.coursesInProgress?.forEach(course => {
            course.completedContent?.forEach(content => {
                if (typeof content.score === 'number') {
                    totalScore += content.score;
                    scoredActivities++;
                }
            });
        });
        const averageScore = scoredActivities > 0 ? Math.round(totalScore / scoredActivities) : 0;
        
        // 4. Calcular o Nível de Competência por Categoria (a nova lógica complexa)
        const categoriesData: { [key: string]: { totalScore: number, totalWeight: number } } = {};

        const allUserCourses = [
            ...(employee.coursesInProgress || []),
            ...(employee.completedCoursesList || [])
        ];
        
        allUserCourses.forEach((courseProgress: any) => {
            if (!courseProgress.courseId) return; // Segurança caso um curso seja deletado

            const category = courseProgress.courseId.category;
            const difficulty = courseProgress.courseId.difficulty; // Peso do curso

            if (!categoriesData[category]) {
                categoriesData[category] = { totalScore: 0, totalWeight: 0 };
            }
            
            // Para cursos concluídos, a nota é 100. Para os em progresso, pegamos a média das atividades.
            let averageCourseScore = 100; // Default para cursos completos
            if(courseProgress.completedContent) { // se for um curso em progresso
                let courseTotalScore = 0;
                let courseScoredActivities = 0;
                courseProgress.completedContent.forEach((content: any) => {
                    if (typeof content.score === 'number') {
                        courseTotalScore += content.score;
                        courseScoredActivities++;
                    }
                });
                if(courseScoredActivities > 0) {
                    averageCourseScore = courseTotalScore / courseScoredActivities;
                } else {
                    averageCourseScore = 0; // Se não tem atividades com nota, a média é 0.
                }
            }

            categoriesData[category].totalScore += averageCourseScore * difficulty;
            categoriesData[category].totalWeight += difficulty;
        });

        const competencies = Object.keys(categoriesData).map(category => ({
            category: category,
            competenceLevel: Math.round(categoriesData[category].totalScore / categoriesData[category].totalWeight)
        }));

        // 5. Montar a resposta final
        return {
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            competencies: competencies,
            courses: {
                completed: employee.completedCoursesList?.map((c: any) => ({
                    id: c.courseId._id.toString(),
                    image: c.courseId.image, // Adicionando imagem para o card
                    title: c.courseId.title,
                    category: c.courseId.category,
                    difficulty: c.courseId.difficulty,
                    score: c.finalScore || 100 // Usar a nota final se existir
                })) || [],
                inProgress: employee.coursesInProgress?.map((c: any) => ({
                    id: c.courseId._id.toString(),
                    image: c.courseId.image, // Adicionando imagem para o card
                    title: c.courseId.title,
                    category: c.courseId.category,
                    difficulty: c.courseId.difficulty,
                    progress: c.progress
                })) || [],
                notStarted: notStarted.map(course => ({
                    id: course._id.toString(),
                    image: course.image, // Adicionando imagem para o card
                    title: course.title,
                    category: course.category,
                    difficulty: course.difficulty
                }))
            },
            averageScore: averageScore,
            totalCourses: allUserCourses.length,
            coursesCompleted: employee.completedCoursesList?.length || 0
        };
    }

    public async getTeam(managerId: string): Promise<any> {
        const team = await User.find({ manager: managerId }, 'name email').lean();

        return team.map(member => ({
            id: member._id.toString(),
            name: member.name,
            email: member.email
        }));
    }

    public async getEmployeeCourseStatus(managerId: string, employeeId: string): Promise<any> {
        const employee = await User.findById(employeeId).lean();

        // Validação de segurança
        if (!employee || employee.manager?.toString() !== managerId) {
            throw new AppError('Funcionário não encontrado ou não pertence à sua equipe.', 404);
        }

        const allCourses = await Course.find({ isActive: true }, 'title').lean();

        // Cria mapas para busca rápida
        const inProgressMap = new Map(employee.coursesInProgress?.map((c: any) => [c.courseId.toString(), c]));
        const completedSet = new Set(employee.completedCoursesList?.map((c: any) => c.courseId.toString()));

        const statusList = allCourses.map(course => {
            const courseIdStr = course._id.toString();
            let status = 3; // 3 = Não iniciado (padrão)
            if (completedSet.has(courseIdStr)) {
                status = 1; // 1 = Completo
            } else if (inProgressMap.has(courseIdStr)) {
                status = 2; // 2 = Em progresso
            }
            return {
                courseId: courseIdStr,
                title: course.title,
                status: status
            };
        });

        return statusList;
    }
}