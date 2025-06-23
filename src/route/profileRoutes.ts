import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { ProfileController } from '../controller/profileController.ts';
import { ProfileService } from '../service/profileService.ts';
import { imageUpload } from '../../config/multer.ts';

const profileRouter = Router();

const profileService = new ProfileService();
const profileController = new ProfileController(profileService);

profileRouter.get('/', authMiddleware, profileController.getProfile);

profileRouter.put(
    '/',
    authMiddleware,
    imageUpload.single('photoUser'),
    profileController.updateProfile
);

export default profileRouter;