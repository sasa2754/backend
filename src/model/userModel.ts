import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedCourse {
  id: number;
  title: string;
  image: string;
  certificateAvailable: boolean;
}

export interface ICalendarItem {
  date: Date;
  type: 1 | 2 | 3; // lembrete, atividade, prova
  description: string;
}

export type UserRole = 'employee' | 'manager' | 'admin';

export interface IUser extends Document {
  photoUser?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;

  company: mongoose.Types.ObjectId;
  manager?: mongoose.Types.ObjectId | null;

  // Só employee
  interests?: string[];
  completedCourses?: number;
  averageTest?: number;
  completedCoursesList?: ICompletedCourse[];
  ongoingCourses?: number;
  totalCourses?: number;
  progressPercentGeneral?: number;
  coursesInProgress?: {
    id: number;
    title: string;
    image: string;
    progress: number;
    description: string;
    rating: number;
    participants: number;
    difficulty: 1 | 2 | 3;
    category: string;
  }[];
  calendar?: ICalendarItem[];

  // Só manager
  managedEmployees?: mongoose.Types.ObjectId[];

  // Só admin
  companiesManaged?: mongoose.Types.ObjectId[];
}

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
  photoUser: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  coursesInProgress: { type: Array, default: [] },
  calendar: { type: [CalendarItemSchema], default: [] },

  managedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  companiesManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }]
});

export default mongoose.model<IUser>('User', UserSchema);