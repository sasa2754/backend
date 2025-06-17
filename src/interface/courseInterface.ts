import { Document } from "mongoose";

export interface ICourse extends Document {
    isActive: boolean;
    title: string;
    image: string;
    description: string;
    difficulty: number;
    category: string;
    duration: string;
    haveExam: boolean;
    modules: {
        title: string;
        description: string;
        content: {
        type: number;
        title: string;
        description?: string;
        content: {
            type: number;
            title?: string;
            value?: string;
            question?: string;
            options?: {
            id: string;
            text: string;
            }[];
        }[];
        }[];
    }[];
}