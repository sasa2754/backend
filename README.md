🚀 Projeto Iduca - Documentação da API
Bem-vindo(a) à documentação oficial da API da plataforma de cursos Iduca! Este guia detalha todos os endpoints disponíveis, seus parâmetros, e exemplos de uso para facilitar a integração e os testes.

✨ Como Usar
URL Base: Todas as rotas são prefixadas com /api. Ex: http://localhost:8080/api/...

Autenticação: A maioria dos endpoints requer um token de autenticação. Ele deve ser enviado no cabeçalho (Header) da requisição da seguinte forma:
Authorization: Bearer <SEU_TOKEN_JWT_AQUI>

Formato de Dados: Todas as requisições e respostas que contém dados utilizam o formato JSON.

🌟 Fluxos de Uso Comuns
(Os fluxos que você descreveu estão perfeitos e continuam válidos!)

📚 Referência Completa de Endpoints
🔐 Auth - Autenticação (/api/auth)
POST /api/auth/login

Realiza o login de qualquer tipo de usuário.

POST /api/auth/set-initial-password

Usado por um usuário logado para definir sua senha definitiva após o primeiro acesso.

(...e todos os outros endpoints de forgotPass, checkCode, resetPassword)

🏠 Home - Tela Inicial (/api/home)
GET /api/home/progress

Retorna o progresso geral e estatísticas para a tela inicial do usuário logado (Aluno, Manager ou Admin).

Autorização: Bearer Token (qualquer role).

Resposta de Sucesso (200 OK): (O corpo da resposta varia de acordo com a role do usuário, como implementamos).

GET /api/home/coursesInProgress

Retorna até 8 cursos que o usuário está fazendo atualmente.

Autorização: Bearer Token (qualquer role).

Resposta de Sucesso (200 OK): (Array de objetos de curso em progresso).

📘 Courses - Cursos (Acesso Geral /api/courses)
GET /api/courses

Retorna a lista paginada de cursos, com suporte a filtros.

Autorização: Bearer Token (qualquer role).

Query Params: page, search, category, difficulty.

GET /api/courses/:id

Retorna os detalhes de um curso específico, incluindo módulos e progresso do usuário.

Autorização: Bearer Token (qualquer role).

GET /api/courses/:courseId/lessons/:lessonId

Retorna o conteúdo completo de uma aula ou atividade específica.

Autorização: Bearer Token (qualquer role).

POST /api/courses/:courseId/lessons/:lessonId/complete

Marca uma aula/vídeo como concluído pelo usuário e atualiza o progresso.

Autorização: Bearer Token (qualquer role).

POST /api/courses/:courseId/lessons/:lessonId/submit

Envia as respostas de um quiz para correção e atualiza o progresso.

Autorização: Bearer Token (qualquer role).

📝 Activities - Atividades (/api/activities)
POST /api/activities/:courseId/lessons/:lessonId/upload

Envia um arquivo PDF como resposta para uma atividade de upload.

Autorização: Bearer Token (qualquer role).

Corpo: form-data com uma chave pdfFile contendo o arquivo.

🗓️ Calendar - Calendário (/api/calendar)
POST /api/calendar/reminder

Permite ao usuário adicionar um lembrete pessoal.

Autorização: Bearer Token (qualquer role).

Corpo (Request Body): { "title": "Estudar para a prova", "date": "2025-05-18" }

GET /api/calendar

Retorna todos os eventos do usuário (lembretes + prazos) em uma janela de 1 ano.

Autorização: Bearer Token (qualquer role).

GET /api/calendar/next

Retorna os eventos dos próximos 7 dias.

Autorização: Bearer Token (qualquer role).

👤 Profile - Perfil do Usuário (/api/profile)
GET /api/profile

Retorna todas as informações do perfil do usuário logado.

Autorização: Bearer Token (qualquer role).

PUT /api/profile

Permite que o usuário edite sua foto e/ou interesses.

Autorização: Bearer Token (qualquer role).

Corpo: form-data com os campos photoUser (tipo File) e/ou interests (array de strings).

🎓 Certificate - Certificados (/api/certificate)
GET /api/certificate/:id/pdf

Retorna o PDF do certificado de um curso finalizado.

Autorização: Bearer Token (qualquer role).

Parâmetros de URL: :id = ID do curso concluído.

🧑‍💼 Manager - Gestão de Equipe (/api/manager)
GET /api/manager/dashboard

Retorna os dados agregados da equipe para o dashboard principal do manager.

Autorização: Bearer Token (role: "manager").

GET /api/manager/employeesSummary

Retorna um resumo de desempenho de todos os funcionários da equipe do manager.

Autorização: Bearer Token (role: "manager").

GET /api/manager/team

Retorna a lista simples de colaboradores (id, nome, email) do time do manager.

Autorização: Bearer Token (role: "manager").

GET /api/manager/courses-status?employeeId={id}

Retorna a lista de todos os cursos da plataforma com o status de inscrição de um colaborador específico.

Autorização: Bearer Token (role: "manager").

GET /api/manager/employee/:id/dashboard

Retorna um dashboard com todas as informações detalhadas de um colaborador específico.

Autorização: Bearer Token (role: "manager").

POST /api/manager/enroll

Inscreve um funcionário da sua equipe em um curso.

Autorização: Bearer Token (role: "manager").

🏢 Admin - Gestão do Sistema (/api/admin/...)
(Todos os endpoints de /api/admin/companies e /api/admin/courses que já listamos antes entram aqui)

🌐 Geral (/api/...)
GET /api/categories

Retorna a lista de categorias de curso disponíveis.

Autorização: Nenhuma ou Bearer Token (qualquer role).

GET /api/interests

Retorna a lista de interesses disponíveis para o perfil.

Autorização: Nenhuma ou Bearer Token (qualquer role).