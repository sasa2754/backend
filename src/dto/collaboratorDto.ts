// Para pegar o progresso geral do colaborador no GET /home/progress
// RESPONSE
export interface HomeProgressStudentResponseDTO {
  username: string;
  isManager: false;
  isAdmin: false;
  totalCourses: number;
  ongoingCourses: number;
  completeCourses: number;
  percenteGeneral: number;
}


// Para pegar até 8 cursos em progresso do colaborador no GET /home/coursesInProgress
// RESPONSE
export interface HomeCoursesInProgressResponseDTO {
  id: number;
  title: string;
  image: string;
  progress: number; // porcentagem concluída
  description: string;
  rating: number;
  participants: number;
  difficulty: 1 | 2 | 3; // 1 - Iniciante | 2 - Intermediário | 3 - Avançado
  category: string;
}[];


// Para retornar os lembretes do usuário no GET /home/calendar
// RESPONSE
export interface HomeCalendarResponseDTO {
  date: string; // YYYY-MM-DD
  type: 1 | 2 | 3; // 1 - Lembrete | 2 - Atividade | 3 - Prova
  description: string;
}


// Para retorar as informações do usuário logado no GET /profile
export interface CompletedCourseDTO {
  id: number;
  title: string;
  image: string;
  certificateAvailable: boolean;
}

export interface ProfileResponseDTO {
  photoUser: string;
  name: string;
  email: string;
  interests: string[]; // nomes das categorias
  completedCourses: number;
  averageTest: number;
  completedCoursesList: CompletedCourseDTO[];
}


// Para pegar todos os interesses disponíveis no sistema no GET /interests
export interface InterestDTO {
  id: number;
  name: string;
}

export type InterestsListResponseDTO = InterestDTO[];


// Para editar uma informação do usuário no PUT /profile
// Se for mandar via form-data (por causa da imagem), o backend vai tratar o arquivo + campos.
// REQUEST
export interface UpdateProfileRequestDTO {
  photoUser?: File;       // Arquivo de imagem, se enviado
  interests?: number[];   // IDs dos interesses, máx 5
}

// RESPONSE
export interface UpdateProfileResponseDTO {
  response: boolean;
}

