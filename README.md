===================================================
    DOCUMENTAÇÃO DE ENDPOINTS - PROJETO IDUCA
===================================================

Este documento resume os principais fluxos de uso e todos os endpoints da API.

---------------------------------
 FLUXOS DE USO COMUNS
---------------------------------

---
FLUXO 1: Admin cadastra uma Nova Empresa e seu primeiro Gestor
---
1.  ADMIN FAZ LOGIN: `POST /auth/login` com credenciais de admin. Pega o TOKEN_ADMIN.
2.  ADMIN CRIA UMA EMPRESA: `POST /admin/companies` usando o TOKEN_ADMIN. Pega o COMPANY_ID da resposta.
3.  ADMIN CRIA UM USUÁRIO (GESTOR): `POST /users` usando o TOKEN_ADMIN. No corpo, envia os dados do gestor e o `companyId` da empresa criada. O gestor recebe um e-mail com senha temporária.

---
FLUXO 2: Novo Gestor faz o primeiro login e gerencia sua equipe
---
1.  GESTOR FAZ LOGIN COM SENHA TEMPORÁRIA: `POST /auth/login` com e-mail e senha temporária. Pega o TOKEN_PRIMEIRO_ACESSO.
2.  GESTOR DEFINE SUA SENHA DEFINITIVA: `POST /auth/set-initial-password` usando o TOKEN_PRIMEIRO_ACESSO.
3.  GESTOR FAZ LOGIN NOVAMENTE: `POST /auth/login` com a nova senha. Pega o TOKEN_GESTOR_NORMAL.
4.  GESTOR CRIA UM FUNCIONÁRIO: `POST /users` usando o TOKEN_GESTOR_NORMAL. O funcionário é criado na mesma empresa do gestor.
5.  GESTOR INSCREVE FUNCIONÁRIO EM UM CURSO: `POST /manager/enroll` usando o TOKEN_GESTOR_NORMAL. No corpo, envia o `employeeId` e o `courseId`.

---
FLUXO 3: Aluno realiza uma aula e um quiz
---
1.  ALUNO FAZ LOGIN: `POST /auth/login`. Pega o TOKEN_ALUNO.
2.  ALUNO LISTA OS CURSOS: `GET /courses` usando o TOKEN_ALUNO para ver os cursos disponíveis.
3.  ALUNO VÊ DETALHES DE UM CURSO: `GET /courses/:courseId` para ver os módulos e aulas. Pega o `lessonId` de uma aula e o `quizId` de uma atividade.
4.  ALUNO COMPLETA UMA AULA SIMPLES: `POST /courses/:courseId/lessons/:lessonId/complete` para marcar a aula como concluída e atualizar o progresso.
5.  ALUNO FAZ UM QUIZ: `POST /courses/:courseId/lessons/:quizId/submit` enviando as respostas no corpo da requisição. Recebe a nota e o progresso atualizado.
6.  ALUNO VÊ NOTIFICAÇÃO: `GET /notifications` para ver a notificação da inscrição feita pelo gestor.


===================================================
    REFERÊNCIA COMPLETA DE ENDPOINTS
===================================================

---------------------------------
 AUTH - Autenticação (/auth)
---------------------------------

Endpoint: POST /auth/login
Descrição: Realiza o login de qualquer tipo de usuário.
... (todos os outros endpoints de auth permanecem os mesmos) ...

Endpoint: POST /auth/set-initial-password
Descrição: Usado por um usuário logado (com `firstAccess: true`) para definir sua senha definitiva.
Autorização: Bearer Token do primeiro acesso.
Corpo (Request Body): { "currentPassword": "senha_temporaria", "newPassword": "nova_senha" }
Resposta de Sucesso (200 OK): { "message": "Senha definida com sucesso." }

----------------------------------------
 ADMIN - Empresas (/admin/companies)
----------------------------------------

Endpoint: POST /admin/companies
Descrição: Cria uma nova empresa cliente no sistema.
Autorização: Bearer Token (role: "admin").
Corpo (Request Body): { "name": "Nome da Nova Empresa" }
Resposta de Sucesso (201 Created): { "message": "Company created successfully", "companyId": "6674c1a2b3d4e5f6g7h8i9j0" }

---

Endpoint: GET /admin/companies
Descrição: Lista todas as empresas cadastradas.
Autorização: Bearer Token (role: "admin").
Resposta de Sucesso (200 OK): { "companies": [{ "id": "...", "name": "..." }] }

---

Endpoint: DELETE /admin/companies/:companyId
Descrição: Deleta uma empresa e TODOS os funcionários associados a ela.
Autorização: Bearer Token (role: "admin").

-------------------------------------
 ADMIN - Cursos (/admin/courses)
-------------------------------------

Endpoint: POST /admin/courses
Descrição: Cria um novo curso com módulos e conteúdos.
Autorização: Bearer Token (role: "admin").
Corpo (Request Body): (JSON complexo com a estrutura do curso)
Resposta de Sucesso (201 Created): (Objeto do curso criado)

---

Endpoint: POST /admin/courses/:courseId/exam
Descrição: Cadastra a prova final para um curso existente.
Autorização: Bearer Token (role: "admin").
Corpo (Request Body): { "title": "Prova Final", "questions": [...] }
Resposta de Sucesso (201 Created): (Objeto da prova criada)

---

Endpoint: DELETE /admin/courses/:courseId
Descrição: Deleta um curso e sua prova associada.
Autorização: Bearer Token (role: "admin").
Resposta de Sucesso (200 OK): { "message": "Course deleted successfully" }

---------------------------------
 USERS - Usuários (/users)
---------------------------------

Endpoint: POST /users
Descrição: Cria um novo usuário. O comportamento muda baseado na role do criador.
Autorização: Bearer Token (role: "admin" ou "manager").
... (descrição dos cenários de admin e manager) ...

-----------------------------------------
 MANAGER - Gestão de Equipe (/manager)
-----------------------------------------

Endpoint: POST /manager/enroll
Descrição: Inscreve um funcionário da sua equipe em um curso.
Autorização: Bearer Token (role: "manager").
Corpo (Request Body): { "employeeId": "ID_DO_FUNCIONARIO", "courseId": "ID_DO_CURSO" }
Resposta de Sucesso (200 OK): { "message": "Funcionário inscrito com sucesso!" }

---

Endpoint: GET /manager/employeesSummary
Descrição: Retorna um resumo de desempenho de todos os funcionários da equipe do manager.
Autorização: Bearer Token (role: "manager").
Resposta de Sucesso (200 OK):
[
  {
    "id": "...",
    "name": "Ana Costa",
    "email": "ana@empresa.com",
    "coursesCompleted": 4,
    "coursesInProgress": 2,
    "averageScore": 87,
    "topCategory": "A definir",
    "isManager": false
  }
]

---

Endpoint: GET /manager/dashboard
Descrição: Retorna os dados agregados da equipe para o dashboard principal do manager.
Autorização: Bearer Token (role: "manager").
Resposta de Sucesso (200 OK):
{
  "username": "Nome do Manager",
  "isManager": true,
  "isAdmin": false,
  "totalEmployees": 12,
  "totalCourses": 25,
  "totalRegistrations": 47,
  "completionRate": 73
}

---------------------------------------
 COURSES - Cursos (Acesso Geral /courses)
---------------------------------------

Endpoint: GET /courses
Descrição: Retorna a lista paginada de cursos, com suporte a filtros.
Autorização: Bearer Token (qualquer role).
Query Params: `page`, `search`, `category`, `difficulty`.
Resposta de Sucesso (200 OK):
{
  "currentPage": 1,
  "totalPages": 3,
  "courses": [ ... ]
}

---

Endpoint: GET /courses/:id
Descrição: Retorna os detalhes de um curso específico, incluindo módulos e progresso do usuário.
Autorização: Bearer Token (qualquer role).

---

Endpoint: GET /courses/:courseId/lessons/:lessonId
Descrição: Retorna o conteúdo completo de uma aula ou atividade específica.
Autorização: Bearer Token (qualquer role).

---

Endpoint: POST /courses/:courseId/lessons/:lessonId/complete
Descrição: Marca uma aula/vídeo como concluído pelo usuário e atualiza o progresso.
Autorização: Bearer Token (qualquer role).
Corpo: Nenhum.
Resposta de Sucesso (200 OK): { "message": "...", "newProgress": 50 }

---

Endpoint: POST /courses/:courseId/lessons/:lessonId/submit
Descrição: Envia as respostas de um quiz para correção e atualiza o progresso.
Autorização: Bearer Token (qualquer role).
Corpo (Request Body): { "answers": [{ "questionId": 1, "selectedOptionId": "b" }] }
Resposta de Sucesso (200 OK): { "message": "...", "score": 100, "newProgress": 75, ... }

---------------------------------------------
 ACTIVITIES - Atividades (/activities)
---------------------------------------------

Endpoint: POST /activities/:courseId/lessons/:lessonId/upload
Descrição: Envia um arquivo PDF como resposta para uma atividade de upload.
Autorização: Bearer Token (qualquer role).
Corpo: `form-data` com uma chave `pdfFile` contendo o arquivo.
Resposta de Sucesso (200 OK): { "message": "Atividade enviada com sucesso!", "filePath": "caminho/do/arquivo" }

------------------------------------------------
 NOTIFICATIONS - Notificações (/notifications)
------------------------------------------------

Endpoint: GET /notifications
Descrição: Busca as notificações mais recentes para o usuário logado.
Autorização: Bearer Token (qualquer role).
Resposta de Sucesso (200 OK): (Array de objetos de notificação)

---

Endpoint: PATCH /notifications/:notificationId/read
Descrição: Marca uma notificação específica como lida.
Autorização: Bearer Token (qualquer role).
Resposta de Sucesso (200 OK): (Objeto da notificação atualizado com `isRead: true`)