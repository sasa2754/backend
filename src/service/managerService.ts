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
}