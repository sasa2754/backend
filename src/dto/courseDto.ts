// Para o bloco de conteúdo dentro das aulas e atividades
export interface ContentBlockDTO {
  type: number; // 1 = texto, 2 = imagem, etc.
  title?: string;
  value?: string;
  question?: string;
  options?: {
    id: string;
    text: string;
  }[];
  id?: number; // só para perguntas das atividades (type 3)
}

// Para o conteúdo dentro do módulo
export interface ModuleContentDTO {
  type: number; // 1 = aula escrita, 2 = aula vídeo, 3 = atividade múltipla escolha, 4 = atividade pdf
  title: string;
  description?: string;
  content: ContentBlockDTO[];
}

// Para o módulo inteiro
export interface ModuleDTO {
  title: string;
  description: string;
  content: ModuleContentDTO[];
}

// Principal para criar um curso no POST /admin/course
// REQUEST
export interface CreateCourseRequestDTO {
  title: string;
  image: string;
  description: string;
  difficulty: number; // 1, 2 ou 3
  category: string;
  duration: string; // "HH:MM:SS"
  haveExam: boolean;
  modules: ModuleDTO[];
}

// Para a opção da questão
export interface ExamOptionDTO {
  id: string;   // Ex: "a", "b", "c"
  text: string; // Texto da opção
}

// Para a questão da prova
export interface ExamQuestionDTO {
  id?: number;
  question: string;
  options: ExamOptionDTO[];
}

// Para criar uma prova no POST /admin/course/exam
// REQUEST
export interface CreateExamRequestDTO {
  courseId: string; 
  title: string;
  questions: ExamQuestionDTO[];
}

// RESPONSE
export interface CreateExamResponseDTO {
  message: string;
  examId: string; // ID da prova criada
}

// Para deletar uma prova no DELETE /admin/course/{idCourse}
export interface DeleteCourseResponseDTO {
  message: string; // Ex: "Course deleted successfully"
}


// Para pegar todos os cursos no GET /courses
export interface CourseListItemDTO {
  id: number;
  title: string;
  image: string;
  progress: number; // porcentagem do curso feito pelo aluno
  description: string;
  rating: number;
  participants: number;
  difficulty: 1 | 2 | 3; // 1 - Iniciante | 2 - Intermediário | 3 - Avançado
  category: string;
}

export interface CourseListResponseDTO {
  currentPage: number;
  totalPages: number;
  courses: CourseListItemDTO[];
}


// Para pegar todas as categorias no GET /categories
export interface CategoryDTO {
  id: number;
  name: string;
}


// Para pegar as informações gerais de um curso específico no GET /courses/{courseId}
export interface CourseModuleContentDTO {
  id: number;
  type: 1 | 2 | 3 | 4; // Aula escrita, vídeo, quiz, PDF
  title: string;
  completed: boolean;
}

export interface CourseModuleDTO {
  id: number;
  title: string;
  description: string;
  content: CourseModuleContentDTO[];
}

export interface CourseDetailsResponseDTO {
  id: number;
  title: string;
  image: string;
  description: string;
  rating: number;
  participants: number;
  progress: number;
  difficulty: number;
  duration: string; // "HH:MM:SS"
  category: string;
  haveExam: boolean;
  modules: CourseModuleDTO[];
}


// Para pegar os dados completos de uma aula no GET /lessons/{lessonId}
// Aula escrita
export interface LessonTextContentDTO {
  type: 1 | 2; // 1 = texto, 2 = imagem
  title?: string; // só tem se for texto
  value: string;
}

export interface NextLessonDTO {
  id: number;
  type: 1 | 2 | 3 | 4;
  title: string;
}

export interface LessonTextResponseDTO {
  id: number;
  type: 1;
  title: string;
  courseId: number;
  completed: boolean;
  content: LessonTextContentDTO[];
  nextLesson: NextLessonDTO | false;
}

// Aula vídeo
export interface LessonVideoResponseDTO {
  id: number;
  type: 2;
  title: string;
  courseId: number;
  completed: boolean;
  content: { type: 2; value: string }[];
  nextLesson: NextLessonDTO | false;
}

// Atividade múltipla escolha
export interface QuizOptionDTO {
  id: string;
  text: string;
  alternative: string;
}

export interface QuizQuestionDTO {
  id: number;
  question: string;
  options: QuizOptionDTO[];
}

export interface LessonQuizResponseDTO {
  id: number;
  type: 3;
  title: string;
  courseId: number;
  completed: boolean;
  content: QuizQuestionDTO[];
}

// Atividade PDF
export interface LessonPDFResponseDTO {
  id: number;
  type: 4;
  title: string;
  courseId: number;
  completed: boolean;
  description: string;
}


// Para enviar as respostas do aluno nas atividades de múltipla escolha no POST /activities/:id/submitQuiz
// REQUEST
export interface SubmitQuizRequestDTO {
  answers: {
    questionId: number;
    selectedOptionId: string;
  }[];
}

// RESPONSE
export interface SubmitQuizResponseDTO {
  response: boolean;
}


// Para enviar uma atividade PDF no POST /activities/:id/upload
// REQUEST
export interface UploadPDFRequestDTO {
  file: File; // PDF
}

// RESPONSE
export interface UploadPDFResponseDTO {
  response: boolean;
}


// Para pegar as questões e alternativas de uma prova no GET /test/{testId}
export interface TestResponseDTO {
  id: number;
  title: string;
  courseId: number;
  completed: boolean;
  content: QuizQuestionDTO[];
}
