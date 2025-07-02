import { Request, Response } from 'express';
import { CertificateService } from '../service/certificateService.ts';
import { AppError } from '../error/AppError.ts';

// Interface para requisições que passaram pelo authMiddleware
interface AuthRequest extends Request {
    user?: { sub: string; };
}

export class CertificateController {
    constructor(private certificateService: CertificateService) {}

    // Helper privado para centralizar o tratamento de erros
    private handleError(error: unknown, res: Response) {
        if (error instanceof AppError) {
            return res.json({ message: error.message });
        }
        console.error("ERRO INESPERADO NO CERTIFICATE CONTROLLER:", error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }

    /**
     * Entrega o certificado de um curso em formato PDF.
     */
    public getCertificatePdf = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            
            const { id: courseId } = req.params;

            const pdfBuffer = await this.certificateService.generateCertificatePdf(userId, courseId);

            // Configura os Headers da resposta para o tipo PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=certificado-${courseId}.pdf`);

            // Envia o buffer do PDF como resposta
            res.send(pdfBuffer);

        } catch (error) {
            this.handleError(error, res);
        }
    };

    /**
     * Entrega o certificado de um curso em formato de Imagem (PNG).
     */
    public getCertificateImage = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.sub;
            if (!userId) throw new AppError('Usuário não autenticado.', 401);
            
            const { id: courseId } = req.params;

            // Chama o novo método que criamos no serviço
            const imageBuffer = await this.certificateService.generateCertificateImage(userId, courseId);

            // Configura os Headers da resposta para o tipo IMAGEM
            res.setHeader('Content-Type', 'image/png');

            // Envia o buffer da imagem como resposta
            res.send(imageBuffer);

        } catch (error) {
            this.handleError(error, res);
        }
    };
}