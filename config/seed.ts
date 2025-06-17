import bcrypt from 'bcrypt';
import User from '../src/model/userModel.ts';

export const seedAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('Credenciais de admin padrão não definidas no .env. Pulando o seeding.');
            return;
        }

        const filter = { email: adminEmail };

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const update = {
            $setOnInsert: {
                name: 'Admin Iduca',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                firstAccess: false,
                company: null
            }
        };

        const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        };

        const result = await User.findOneAndUpdate(filter, update, options);


        if (result) {
            console.log('Usuário admin verificado. Pronto para uso.');
        }

    } catch (error) {
        console.error('Erro ao criar o usuário admin padrão:', error);
    }
};