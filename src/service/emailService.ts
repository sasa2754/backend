import nodemailer, { Transporter } from 'nodemailer'; // Importando o tipo Mail para o transporter

// Não criamos o transporter aqui fora.
let transporter: Transporter | null = null;

// Criamos uma função para inicializar o transporter SÓ QUANDO NECESSÁRIO.
const getTransporter = () => {
    // Se o transporter ainda não foi criado, crie-o.
    if (!transporter) {
        // Agora, quando este código for executado, temos certeza que o dotenv.config() já rodou.
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('As credenciais de e-mail não estão configuradas corretamente no arquivo .env');
        }

        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};

// Função para enviar e-mail de recuperação de senha
export const sendPasswordResetEmail = async (to: string, code: string) => {
    try {
        // Pega ou cria a instância do transporter
        const mailer = getTransporter();

        const mailOptions = {
            from: `"Plataforma Iduca" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Seu código de recuperação de senha',
            html: `<div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Recuperação de Senha - Iduca</h2>
                    <p>Olá,</p>
                    <p>Você solicitou a recuperação de sua senha. Use o código abaixo para continuar o processo.</p>
                    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0056b3;">
                        ${code}
                    </p>
                    <p>Este código é válido por 10 minutos.</p>
                    <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
                    <br>
                    <p>Atenciosamente,</p>
                    <p><strong>Equipe Iduca</strong></p>
                </div>`, // Mantenha seu HTML
        };

        const info = await mailer.sendMail(mailOptions);
        console.log('E-mail de recuperação enviado com sucesso! Message ID:', info.messageId);

    } catch (error) {
        console.error('Erro ao enviar o e-mail de recuperação:', error);
    }
};

// Função para enviar e-mail de boas-vindas
export const sendWelcomeEmail = async (to: string, tempPass: string) => {
    try {
        // Pega ou cria a instância do transporter
        const mailer = getTransporter();

        const mailOptions = {
            from: `"Plataforma Iduca" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Bem-vindo(a) à Plataforma Iduca!',
            html: `<h2>Sua conta foi criada!</h2>
                <p>Olá,</p>
                <p>Uma conta foi criada para você na plataforma Iduca. Use as credenciais abaixo para seu primeiro acesso:</p>
                <p><strong>E-mail:</strong> ${to}</p>
                <p><strong>Senha Temporária:</strong> ${tempPass}</p>
                <p>Você será solicitado a criar uma nova senha após o login.</p>`, // Mantenha seu HTML
        };

        await mailer.sendMail(mailOptions);
        console.log(`E-mail de boas-vindas enviado para ${to}`);

    } catch (error) {
        console.error('Erro ao enviar e-mail de boas-vindas:', error);
    }
};