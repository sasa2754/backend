import fs from 'fs/promises'; // Módulo do Node para ler arquivos
import path from 'path';       // Módulo do Node para lidar com caminhos de arquivos
import puppeteer from 'puppeteer'; // A biblioteca para gerar o PDF
import User from '../model/userModel.ts';
import Course from '../model/courseModel.ts';
import { AppError } from '../error/AppError.ts';
import { IUser } from '../interface/userInterface.ts';
import { ICourse } from '../interface/courseInterface.ts';

export class CertificateService {


    public async generateCertificatePdf(userId: string, courseId: string): Promise<Uint8Array> {
        // 1. Validação: O usuário realmente concluiu este curso?
        const user: IUser | null = await User.findById(userId).lean();
        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        const completionRecord = user.completedCoursesList?.find(
            (c: any) => c.courseId.toString() === courseId
        );

        if (!completionRecord) {
            throw new AppError('Você não tem permissão para gerar este certificado, pois não concluiu o curso.', 403);
        }

        // 2. Buscar os detalhes completos do curso
        const course: ICourse | null = await Course.findById(courseId).lean();
        if (!course) {
            throw new AppError('Curso não encontrado.', 404);
        }

        // 3. Ler o template HTML do certificado
        const templatePath = path.join(__dirname, '..', 'templates', 'certificate.template.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

        // 4. Substituir os placeholders pelos dados reais
        const completionDate = new Date(completionRecord.completionDate).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        htmlTemplate = htmlTemplate
            .replace('{{NOME_ALUNO}}', user.name)
            .replace('{{NOME_CURSO}}', course.title)
            .replace('{{DURACAO_CURSO}}', course.duration)
            .replace('{{DATA_CONCLUSAO}}', completionDate);

        // 5. Usar o Puppeteer para converter o HTML em PDF
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumentos importantes para rodar em servidores
        });
        const page = await browser.newPage();
        
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Garante que o CSS (cores, etc.) seja impresso
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close(); // Muito importante para não deixar processos abertos

        // 6. Retornar o PDF em formato de buffer
        return pdfBuffer;
    }
}