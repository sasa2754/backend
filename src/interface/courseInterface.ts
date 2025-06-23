import mongoose, { Document } from "mongoose";

// --- INTERFACES PARA OS SUB-DOCUMENTOS ---

export interface IOption {
    id: string;
    text: string;
    // Mongoose sub-docs não têm _id se o schema for { _id: false }, então não colocamos aqui.
}

export interface IQuestion {
    _id: mongoose.Types.ObjectId;
    id: number;
    question: string;
    options: IOption[];
    correctOptionId: string;
}

export interface IWrittenContentBlock {
    _id: mongoose.Types.ObjectId;
    type: 1 | 2;
    title?: string;
    value: string;
}

// --- INTERFACES MODULARES ---

export interface IModuleContent {
    _id: mongoose.Types.ObjectId;
    type: 1 | 2 | 3 | 4;
    title: string;
    content?: IWrittenContentBlock[];
    deadline?: Date;
    questions?: IQuestion[];
    description?: string;
}

export interface IModule {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    content: IModuleContent[];
}

// --- INTERFACE PRINCIPAL E FINAL DO CURSO ---

export interface ICourse extends Document {
    // _id já é herdado de Document, mas podemos ser explícitos se quisermos.
    // _id: mongoose.Types.ObjectId; 
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