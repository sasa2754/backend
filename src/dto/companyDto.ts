// Para listar empresas no GET /admin/companies
// RESPONSE
export interface CompanyResponseDTO {
  id: string;
  name: string;
}
export interface ListCompaniesResponseDTO {
  companies: CompanyResponseDTO[];
}

// Para criar empresas no POST /admin/companies
// REQUEST
export interface CreateCompanyRequestDTO {
  name: string;
}

// RESPONSE
export interface CreateCompanyResponseDTO {
  message: string; // "Company created successfully"
  companyId: string;
}

// Para deletar empresas no DELETE /admin/companies/{companyId}
// RESPONSE
export interface DeleteCompanyResponseDTO {
  message: string; // "Company and related employees deleted successfully"
}

 

