// Para pegar os eventos do calendário no GET /calendar
export interface CalendarEventDTO {
  date: string; // formato ISO yyyy-MM-dd
  type: 1 | 2 | 3; // 1 = Lembrete, 2 = Atividade, 3 = Prova
  description: string;
}


// Para pegar os próximos eventos do calendário no GET /calendar/next
export type CalendarListResponseDTO = CalendarEventDTO[];


// Para adicionar um lembrete pessoal no POST /calendar/reminder
// REQUEST
export interface CreateReminderRequestDTO {
  title: string; // descrição do lembrete
  date: string;  // formato ISO yyyy-MM-dd
}

// RESPONSE
export interface CreateReminderResponseDTO {
  response: boolean;
}
