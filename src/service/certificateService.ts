import fs from 'fs/promises'; // Módulo do Node para ler arquivos
import path from 'path';       // Módulo do Node para lidar com caminhos de arquivos
import puppeteer from 'puppeteer'; // A biblioteca para gerar arquivos
import User from '../model/userModel.ts';
import Course from '../model/courseModel.ts';
import { AppError } from '../error/AppError.ts';
import { IUser } from '../interface/userInterface.ts';
import { ICourse } from '../interface/courseInterface.ts';
import { fileURLToPath } from 'url'; // 1. Importe a nova função


export class CertificateService {

    /**
     * Gera um buffer de PDF do certificado de um curso concluído por um usuário.
     */
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

        // ...

        // 2. Descubra o caminho do arquivo de uma nova maneira
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // 3. O resto do seu código continua o mesmo
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
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();

        // 6. Retornar o PDF em formato de buffer
        return pdfBuffer;
    }

    /**
     * Gera um buffer de IMAGEM (PNG) do certificado.
     * @param userId ID do usuário que solicita o certificado.
     * @param courseId ID do curso concluído.
     */
    public async generateCertificateImage(userId: string, courseId: string): Promise<Buffer> {
        // A lógica de validação e busca de dados é 99% idêntica
        const user: IUser | null = await User.findById(userId).lean();
        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const completionRecord = user.completedCoursesList?.find((c: any) => c.courseId.toString() === courseId);
        if (!completionRecord) throw new AppError('Você não tem permissão para gerar este certificado.', 403);

        const course: ICourse | null = await Course.findById(courseId).lean();
        if (!course) throw new AppError('Curso não encontrado.', 404);
        
        // Lógica para preencher o template HTML
        const templatePath = path.join(__dirname, '..', 'templates', 'certificate.template.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

        const completionDate = new Date(completionRecord.completionDate).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        htmlTemplate = htmlTemplate
            .replace('{{NOME_ALUNO}}', user.name)
            .replace('{{NOME_CURSO}}', course.title)
            .replace('{{DURACAO_CURSO}}', course.duration)
            .replace('{{DATA_CONCLUSAO}}', completionDate);

        // Usar o Puppeteer para tirar uma "foto" da página
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Ajustamos o tamanho da "janela do navegador" para corresponder a um certificado
        await page.setViewport({ width: 1123, height: 794 }); // Proporção de uma folha A4 em paisagem
        
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        // AQUI ESTÁ A DIFERENÇA: Em vez de page.pdf(), usamos page.screenshot()
        const imageBuffer = await page.screenshot({
            type: 'png',
            fullPage: false // Tira screenshot apenas da área visível (viewport)
        });

        await browser.close();

        return imageBuffer as Buffer; // Fazemos o casting para garantir que o tipo é o que o Express espera
    }
}