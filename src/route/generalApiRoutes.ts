import { Router } from 'express';

const generalApiRouter = Router();

const CATEGORIES = [
  { id: 1, name: "Programação" },
  { id: 2, name: "UX/UI" },
  { id: 3, name: "DevOps" },
  { id: 4, name: "Gestão" },
  { id: 5, name: "Banco de Dados" },
  { id: 6, name: "Inteligência Artificial" },
  { id: 7, name: "Mecânica" },
  { id: 8, name: "Backend" },
  { id: 9, name: "Frontend" },
];

const INTERESTS = [
    { id: 1, name: "Programação" },
    { id: 2, name: "UX/UI" },
    { id: 3, name: "DevOps" },
    { id: 4, name: "Gestão" },
    { id: 5, name: "Banco de Dados" },
    { id: 6, name: "Inteligência Artificial" },
    { id: 7, name: "Mecânica" },
    { id: 8, name: "Backend" },
    { id: 9, name: "Frontend" },
];

// Rota para retornar as categorias de curso
generalApiRouter.get('/categories', (req, res) => {
    res.status(200).json(CATEGORIES);
});

// Rota para retornar os interesses disponíveis
generalApiRouter.get('/interests', (req, res) => {
    res.status(200).json(INTERESTS);
});

export default generalApiRouter;