import mongoose from 'mongoose';
import User from '../model/userModel.ts';
import { AppError } from '../error/AppError.ts';
import { supabase } from '../../config/supabase.config.ts';
import courseModel from '../model/courseModel.ts';
import { IUser } from '../interface/userInterface.ts';

export class ActivityService {
    
    /**
     * Registra a submissão de um PDF para uma atividade, faz o upload para o Supabase
     * e atualiza o progresso do usuário.
     * @param userId ID do usuário logado.
     * @param courseId ID do curso.
     * @param lessonId ID da atividade de upload.
     * @param file O objeto do arquivo enviado pelo Multer.
     */
    
    public async submitPdf(
        userId: string, 
        courseId: string, 
        lessonId: string, 
        file: Express.Multer.File | undefined
    ) {
        // 1. Validações Essenciais
        if (!file) {
            throw new AppError('Nenhum arquivo foi enviado.', 400);
        }

        // Buscamos o usuário completo para poder modificá-lo e salvá-lo
        const user: IUser | null = await User.findById(userId);
        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }
        
        // Verificamos se o usuário está de fato inscrito no curso
        const courseProgress = user.coursesInProgress?.find(p => p.courseId.toString() === courseId);
        if (!courseProgress) {
            throw new AppError('Você não está inscrito neste curso.', 403);
        }

        // Verificamos se esta atividade específica já não foi completada
        const isAlreadyCompleted = courseProgress.completedContent.some(c => c.contentId.toString() === lessonId);
        if (isAlreadyCompleted) {
            throw new AppError('Esta atividade já foi enviada anteriormente.', 409);
        }

        // 2. Lógica de Upload para o Supabase
        const fileName = `${userId}/${lessonId}-${Date.now()}.pdf`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('arquivos-iduca') // Lembre-se de usar o nome do seu bucket
            .upload(fileName, file.buffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            throw new AppError(`Falha no upload para o Supabase: ${uploadError.message}`, 500);
        }

        // 3. Atualização do Progresso do Usuário
        courseProgress.completedContent.push({ 
            contentId: new mongoose.Types.ObjectId(lessonId),
            submissionPath: uploadData.path // <-- Salvamos o caminho que o Supabase retornou
        });

        // 4. Recálculo da Porcentagem de Progresso
        const course = await courseModel.findById(courseId).lean();
        if (!course) {
            // Essa checagem é uma segurança extra, mas o curso já deve existir neste ponto.
            throw new AppError('Curso não encontrado durante o recálculo do progresso.', 404);
        }
        
        const totalContentItems = course.modules.reduce((sum, module) => sum + module.content.length, 0);
        const completedCount = courseProgress.completedContent.length;

        if (totalContentItems > 0) {
            courseProgress.progress = Math.round((completedCount / totalContentItems) * 100);
        }
        
        // 5. Salvar as alterações no documento do usuário
        await user.save();

        // 6. Retornar uma resposta de sucesso
        return { message: "Atividade enviada com sucesso!", filePath: uploadData.path };
    }
}