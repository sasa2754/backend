import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import initRoutes from './route/routes.js';
import connectDB from './database/database.js';
import cors from 'cors';
import { seedAdminUser } from '../config/seed.ts';

const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB conectado com sucesso!');

        const app = express();
        const port = process.env.PORT || 8080;

        
        app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000'
        }));
        
        app.use(express.json());

        
        app.get('/getTeste', (req, res) => {
            res.send('GET: Requisição recebida com sucesso!');
        });

        initRoutes(app);

        app.listen(port, () => console.log(`🚀 Servidor rodando: http://localhost:${port}/`));

    } catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
};

startServer();
seedAdminUser();


// SECRET=aSabrinaÉLindaEMaravilhosa123senhasupersegura

// ADMIN_EMAIL="admin@email.com"
// ADMIN_PASSWORD="admin"