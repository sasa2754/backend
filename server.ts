import express from 'express';
import initRoutes from './src/route/routes.js';
import connectDB from './src/database/database.js';
import cors from 'cors';

const app = express();
const port = 8080;

connectDB();

app.use(cors({
    origin: '*'
}))

initRoutes(app);


app.listen(port, () => console.log(`Acesse: http://localhost:${port}/`));


// app.get('/getTeste', (req, res) => {
//     res.send('GET: Requisição recebida com sucesso!');
// });