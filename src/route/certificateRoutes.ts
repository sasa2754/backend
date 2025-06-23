import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { CertificateController } from '../controller/certificateController.ts';
import { CertificateService } from '../service/certificateService.ts';

const certificateRouter = Router();

const certificateService = new CertificateService();
const certificateController = new CertificateController(certificateService);

// A rota para buscar o PDF do certificado de um curso específico
certificateRouter.get('/:id/pdf', authMiddleware, certificateController.getCertificatePdf);

export default certificateRouter;