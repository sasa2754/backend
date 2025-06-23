import User from '../model/userModel.ts';
import { AppError } from '../error/AppError.ts';
import { supabase } from '../../config/supabase.config.ts';

export class ProfileService {

    public async getProfileData(userId: string): Promise<any> {

        const user = await User.findById(userId)
            .populate('completedCoursesList.courseId', 'title image')
            .lean();

        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        let totalScore = 0;
        let scoredActivities = 0;
        user.coursesInProgress?.forEach(course => {
            course.completedContent?.forEach(content => {
                if (typeof content.score === 'number') {
                    totalScore += content.score;
                    scoredActivities++;
                }
            });
        });
        const averageTest = scoredActivities > 0 ? parseFloat((totalScore / scoredActivities).toFixed(1)) : 0;

        const completedCoursesList = user.completedCoursesList?.map((completed: any) => ({
            id: completed.courseId._id.toString(),
            title: completed.courseId.title,
            image: completed.courseId.image,
            certificateAvailable: completed.certificateAvailable
        })) || [];

        const profileResponse = {
            photoUser: user.photoUser,
            name: user.name,
            email: user.email,
            interests: user.interests || [],
            completedCourses: completedCoursesList.length,
            averageTest: averageTest,
            completedCoursesList: completedCoursesList
        };

        return profileResponse;
    }

    public async updateProfile(
        userId: string, 
        data: { interests?: string[] }, 
        file?: Express.Multer.File
    ): Promise<{ response: true }> {
        
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        if (file) {
            const fileName = `profile-pictures/${userId}-${Date.now()}`;
            
            const { error } = await supabase
                .storage
                .from('imagens-iduca') // Use um bucket para imagens
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true // `upsert: true` pode ser útil para substituir a foto antiga se o nome for o mesmo
                });

            if (error) {
                throw new AppError(`Falha no upload da foto: ${error.message}`, 500);
            }

            const { data: urlData } = supabase.storage.from('imagens-iduca').getPublicUrl(fileName);
            user.photoUser = urlData.publicUrl;
        }

        if (data.interests) {
            if (!Array.isArray(data.interests) || data.interests.length > 5) {
                throw new AppError('Você pode selecionar no máximo 5 interesses.', 400);
            }
            user.interests = data.interests;
        }

        await user.save();

        return { response: true };
    }
}