import User from '../model/userModel.ts';
import Course from '../model/courseModel.ts';
import { AppError } from '../error/AppError.ts';
import { NotificationService } from './notificationService.ts';
import { ICompletedContent, IUser } from '../interface/userInterface.ts';

export class ManagerService {

    private notificationService = new NotificationService();

    public async enrollEmployeeInCourse(
        managerId: string, 
        managerCompanyId: string, 
        data: { employeeId: string, courseId: string }
    ): Promise<{ message: string }> {

        // AQUI ESTÁ A CORREÇÃO: Usamos .lean() para a operação de leitura do curso.
        const course = await Course.findById(data.courseId).lean();

        // Para o funcionário, NÃO usamos .lean() porque vamos modificá-lo e salvá-lo.
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
        // 1. Encontrar todos os funcionários gerenciados por este manager
        const team = await User.find({ manager: managerId }).lean();
        const manager = await User.findById(managerId).lean(); // Pega os dados do próprio manager

        if (!manager) {
            throw new AppError("Manager não encontrado.", 404);
        }

        // 2. Calcular as métricas simples
        const totalEmployees = team.length;
        const totalCoursesOnPlatform = await Course.countDocuments({ isActive: true });

        // 3. Calcular as métricas agregadas (inscrições e taxa de conclusão)
        let totalEnrollments = 0;
        let sumOfProgress = 0;

        team.forEach(employee => {
            const ongoing = employee.coursesInProgress || [];
            const completed = employee.completedCoursesList || [];
            
            totalEnrollments += ongoing.length + completed.length;
            
            // Soma o progresso dos cursos em andamento
            if (ongoing.length > 0) {
                sumOfProgress += ongoing.reduce((sum, course) => sum + course.progress, 0);
            }
            // Soma 100% para cada curso completo
            sumOfProgress += completed.length * 100;
        });
        
        const completionRate = totalEnrollments > 0 ? Math.round(sumOfProgress / totalEnrollments) : 0;

        // 4. Montar a resposta final no formato da sua documentação
        const response = {
            username: manager.name,
            isManager: true,
            isAdmin: false,
            totalEmployees: totalEmployees,
            totalCourses: totalCoursesOnPlatform,
            totalRegistrations: totalEnrollments,
            completionRate: completionRate,
            // Os campos abaixo requerem agregações mais complexas (próximo passo)
            performanceByCategory: [], 
            courseStatus: {}
        };

        return response;
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
}