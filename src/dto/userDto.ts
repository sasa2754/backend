export interface CreateUserRequestDTO {
  employeeId: string;
  name: string;
  email: string;
  isManager: boolean;
  companyId: string;
}