import mongoose, { Document } from "mongoose";

// Interface para as opções de uma questão
export interface IOption {
    id: string;
    text: string;
}

// Interface para uma questão de múltipla escolha
export interface IQuestion {
    id: number;
    question: string;
    options: IOption[];
}

// Interface para um bloco de conteúdo de uma aula escrita (texto ou imagem)
export interface IWrittenContentBlock {
    type: 1 | 2;
    title?: string;
    value: string;
}

// --- INTERFACES MODULARES ---

export interface IModuleContent {
    type: 1 | 2 | 3 | 4;
    title: string;
    content?: IWrittenContentBlock[]; // Para tipo 1 (aula escrita)
    questions?: IQuestion[];          // Para tipo 3 (múltipla escolha)
    description?: string;             // Para tipo 4 (atividade PDF)
}

// Interface para um Módulo
export interface IModule {
    title: string;
    description: string;
    content: IModuleContent[];
}

// --- INTERFACE PRINCIPAL E FINAL DO CURSO ---

export interface ICourse extends Document {
    isActive: boolean;
    title: string;
    image: string;
    description: string;
    difficulty: number;
    category: string;
    duration: string;
    haveExam: boolean;
    modules: IModule[];
    exam?: mongoose.Types.ObjectId;
}