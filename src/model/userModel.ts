import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../interface/userInterface.ts';


const CompletedCourseSchema: Schema = new Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  certificateAvailable: { type: Boolean, required: true }
}, { _id: false });

const CalendarItemSchema: Schema = new Schema({
  date: { type: Date, required: true },
  type: { type: Number, enum: [1, 2, 3], required: true },
  description: { type: String, required: true }
}, { _id: false });

const UserSchema: Schema = new Schema({
  employeeId: { type: String, required: true, unique: true },
  photoUser: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstAccess: { type: Boolean, default: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], required: true },

  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  interests: { type: [String], default: [], validate: [(val: string[]) => val.length <= 5, 'Máximo 5 interesses'] },
  completedCourses: { type: Number, default: 0 },
  averageTest: { type: Number, default: 0 },
  completedCoursesList: { type: [CompletedCourseSchema], default: [] },
  ongoingCourses: { type: Number, default: 0 },
  totalCourses: { type: Number, default: 0 },
  progressPercentGeneral: { type: Number, default: 0 },
  coursesInProgress: [{
      _id: false,
      // ID do curso que está em progresso
      courseId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Course',
          required: true 
      },
      // Progresso geral do usuário no curso (ex: 20%)
      progress: { 
          type: Number, 
          default: 0 
      },
      // Array para guardar os IDs de cada aula/atividade completada
      completedContent: [{
          _id: false,
          contentId: { type: mongoose.Schema.Types.ObjectId }
      }]
  }],
  calendar: { type: [CalendarItemSchema], default: [] },

  managedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  companiesManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
});

export default mongoose.model<IUser>('User', UserSchema);