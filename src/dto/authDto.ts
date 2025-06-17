// Para fazer login no POST /auth/login
// REQUEST
export interface AuthLoginRequestDTO {
  email: string;
  password: string;
}

// RESPONSE
export interface AuthLoginResponseDTO {
  token: string;
  firstAccess: boolean;
}


// Para caso o usuário tenha esquecido a senha (para enviar o código no email) no POST /auth/forgotPass
// REQUEST
export interface AuthForgotPassRequestDTO {
  email: string;
}

// RESPONSE
export interface AuthForgotPassResponseDTO {
  response: boolean;
}


// Para conferir se o código ta certo no POST /auth/checkCode
// REQUEST
export interface AuthCheckCodeRequestDTO {
  email: string;
  code: string; // 5 dígitos como string
}

// RESPONSE
export interface AuthCheckCodeResponseDTO {
  response: boolean;
}


// Para reenviar o código caso o usuário não tenha recebido no POST /auh/resendCode
// REQUEST
export interface AuthResendCodeRequestDTO {
  email: string;
}

// RESPONSE
export interface AuthResendCodeResponseDTO {
  response: boolean;
}


// Para resetar a senha do usuário no POST /auth/resetPassword
// REQUEST
export interface AuthResetPasswordRequestDTO {
  email: string;
  newPassword: string;
}

// RESPONSE
export interface AuthResetPasswordResponseDTO {
  response: boolean;
}

