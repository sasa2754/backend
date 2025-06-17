// Para pegar o dashboard do manager no GET /manager/dashboard
// RESPONSE
export interface ManagerDashboardResponseDTO {
  totalEmployees: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number; // porcentagem
  performanceByCategory: {
    category: string;
    score: number; // média ou pontuação da categoria
  }[];
  courseStatus: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

// Para pegar a lista dos colaboradores do time do manager logado no GET /manager/team
// RESPONSE
export interface ManagerTeamResponseDTO {
  id: number;
  name: string;
  email: string;
}[]


// Para retornar uma lista de cursos com status de inscrição de um colaborador específico no GET /manager/courses-status?employeeId={id}
// RESPONSE
export interface ManagerCourseStatusResponseDTO {
  courseId: number;
  title: string;
  status: 1 | 2 | 3; // 1 - Completo | 2 - Em progresso | 3 - Não iniciado
}[]


// Para inscrever um colaborador em algum curso no POST /manager/enroll
// REQUEST
export interface ManagerEnrollRequestDTO {
  employeeId: number;
  courseId: number;
}

// RESPONSE
export interface ManagerEnrollResponseDTO {
  response: boolean; // true se inscreveu, false se falhou
}


// Para pegar as competências por categoria
// RESPONSE
export interface ManagerCompetenceCategoryDTO {
  category: string;
  competenceLevel: number; // média ponderada
}[]


// Para pegar as informações gerais das pessoas pro manager poder ver no GET /manager/employessSummary
// RESPONSE
export interface ManagerEmployeeSummaryDTO {
  id: number;
  name: string;
  email: string;
  coursesCompleted: number;
  coursesInProgress: number;
  averageScore: number; // média de notas dos cursos
  topCategory: string; // categoria com melhor desempenho
  isManager: boolean;
}[]


// Para pegar o dashboard de um colaborador específico no GET /manager/employee/{id}/dashboard
// RESPONSE
export interface ManagerEmployeeDashboardDTO {
  employeeId: number;
  name: string;
  email: string;
  competencies: {
    category: string;
    competenceLevel: number;
  }[];
  courses: {
    completed: {
      title: string;
      category: string;
      difficulty: 1 | 2 | 3;
      score: number;
    }[];
    inProgress: {
      title: string;
      category: string;
      difficulty: 1 | 2 | 3;
      progress: number; // porcentagem
    }[];
    notStarted: {
      title: string;
      category: string;
      difficulty: 1 | 2 | 3;
    }[];
  };
  averageScore: number;
  totalCourses: number;
  coursesCompleted: number;
}


// Para criar um novo colaborador no sistema no POST /manager/employees
// REQUEST
export interface ManagerCreateEmployeeRequestDTO {
  id: number; // ID do funcionário na empresa
  name: string;
  email: string;
  isManager: boolean;
}

// RESPONSE
export interface ManagerCreateEmployeeResponseDTO {
  message: string;
  employeeId: number;
}
