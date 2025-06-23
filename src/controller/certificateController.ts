import { Request, Response } from 'express';
import { CertificateService } from '../service/certificateService.ts';
import { AppError } from '../error/AppError.ts';

interface AuthRequest extends Request { user?: { sub: string; }; }

export class CertificateController {
    constructor(private certificateService: CertificateService) {}

    public getCertificatePdf = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            
            const { id: courseId } = req.params; // Pega o ID do curso da URL

            const pdfBuffer = await this.certificateService.generateCertificatePdf(userId, courseId);

            // Configura os Headers da resposta para o tipo PDF
            res.setHeader('Content-Type', 'application/pdf');
            // 'inline' tenta abrir o PDF no navegador. 'attachment' forçaria o download.
            res.setHeader('Content-Disposition', `inline; filename=certificado-${courseId}.pdf`);

            // Envia o buffer do PDF como resposta
            res.send(pdfBuffer);

        } catch (error) {
            // ... (seu tratamento de erro padrão) ...
        }
    };

    // Futuramente, um método getCertificateImage viria aqui
}