import mongoose, { Schema, Document } from 'mongoose';

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

const CourseSchema: Schema = new Schema({
    isActive: { type: Boolean, default: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: Number, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    haveExam: { type: Boolean, required: true },
    modules: [
        {
        title: { type: String, required: true },
        description: { type: String, required: true },
        content: [
            {
            type: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String },
            content: [
                {
                type: { type: Number, required: true },
                title: { type: String },
                value: { type: String },
                question: { type: String },
                options: [
                    {
                    id: { type: String },
                    text: { type: String }
                    }
                ]
                }
            ]
            }
        ]
        }
    ]
});

export default mongoose.model<ICourse>('Course', CourseSchema);
