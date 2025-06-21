import mongoose, { Schema, Document } from 'mongoose';
import { IExam } from '../interface/examInterface.ts';

const OptionSchema: Schema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const QuestionSchema: Schema = new Schema({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  options: { type: [OptionSchema], required: true },
  correctOptionId: { type: String, required: true } 
}, { _id: false });

const ExamSchema: Schema = new Schema({
  title: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
  questions: { type: [QuestionSchema], required: true }
}, { timestamps: true });

export default mongoose.model<IExam>('Exam', ExamSchema);