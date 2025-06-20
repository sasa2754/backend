import mongoose, { Document } from 'mongoose';

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
  employeeId: string;
  photoUser?: string;
  name: string;
  email: string;
  password: string;
  firstAccess: boolean;
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