import mongoose, { Schema, Document } from 'mongoose';
import { ICourse } from '../interface/courseInterface.ts';


// Schema para as opções de uma questão de múltipla escolha
const OptionSchema: Schema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true }
});

// Schema para uma questão (usado em atividades e provas)
const QuestionSchema: Schema = new Schema({
    id: { type: Number, required: true },
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true },
    correctOptionId: { type: String, required: true } 
});

// Schema para os blocos de uma aula escrita (texto ou imagem)
const WrittenContentBlockSchema: Schema = new Schema({
    type: { type: Number, required: true, enum: [1, 2] }, // 1 = texto, 2 = imagem
    title: { type: String }, // Título opcional para blocos de texto
    value: { type: String, required: true } // O texto ou a URL da imagem
});


// --- SCHEMAS PRINCIPAIS ---

const ModuleContentSchema: Schema = new Schema({
    type: { type: Number, required: true, enum: [1, 2, 3, 4] }, // 1: Escrita, 2: Vídeo, 3: Múltipla Escolha, 4: PDF
    title: { type: String, required: true },
    
    // Campo para o tipo 1 (Aula escrita)
    content: { type: [WrittenContentBlockSchema], required: false },
    deadline: { type: Date, required: false },
    
    // Campo para o tipo 2 (Vídeo) - Simplificado, o 'content' anterior pode ser usado

    // Campo para o tipo 3 (Atividade Múltipla Escolha)
    questions: { type: [QuestionSchema], required: false },

    // Campo para o tipo 4 (Atividade PDF)
    description: { type: String, required: false }
});


// Schema para um Módulo
const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: [ModuleContentSchema]
});


// Schema Principal e Final do Curso
const CourseSchema: Schema = new Schema({
    isActive: { type: Boolean, default: true },
    title: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: Number, required: true, enum: [1, 2, 3] },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    haveExam: { type: Boolean, required: true, default: false },
    modules: [ModuleSchema],
    exam: { type: Schema.Types.ObjectId, ref: 'Exam' }
}, {
    timestamps: true
});

export default mongoose.model<ICourse>('Course', CourseSchema);