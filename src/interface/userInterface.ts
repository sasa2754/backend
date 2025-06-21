import mongoose, { Document } from 'mongoose';

export interface ICompletedCourse {
  id: string;
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

export interface ICompletedContent {
  contentId: mongoose.Types.ObjectId;
  score?: number;
  submissionPath?: any;
}

export interface ICourseInProgress {
  courseId: string;
  progress: number;
  completedContent: ICompletedContent[];
}

export interface IUser extends Document {
  employeeId: string;
  photoUser?: string;
  name: string;
  email: string;
  password: string;
  firstAccess: boolean;
  role: UserRole;


  company?: mongoose.Types.ObjectId | null; 
  manager?: mongoose.Types.ObjectId | null;

  interests?: string[];
  completedCourses?: number;
  averageTest?: number;
  completedCoursesList?: ICompletedCourse[];
  ongoingCourses?: number;
  totalCourses?: number;
  progressPercentGeneral?: number;
  
  coursesInProgress?: ICourseInProgress[];
  
  calendar?: ICalendarItem[];

  // Seção do "manager"
  managedEmployees?: mongoose.Types.ObjectId[];

  // Seção do "admin"
  companiesManaged?: mongoose.Types.ObjectId[];
}