import mongoose, { Document } from "mongoose";

// Interface para uma única opção de resposta
export interface IOption extends Document {
  id: string;
  text: string;
}

// Interface para uma única pergunta
export interface IQuestion extends Document {
  id: number;
  question: string;
  options: IOption[];
}

// Interface principal da Prova
export interface IExam extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  questions: IQuestion[];
}