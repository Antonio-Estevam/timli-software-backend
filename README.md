# Barbearia - Backend v2 (MVC) 

Projeto backend em Node.js + TypeScript com Prisma e PostgreSQL, arquitetura MVC.
Inclui:
- Cálculo dinâmico de slots por duração do serviço
- Bloqueio de sobreposição de agendamentos
- Suporte a fuso horário (luxon)

### Como usar
1. Copie `.env.example` para `.env` e ajuste `DATABASE_URL`.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run prisma:seed`
6. `npm run dev`

### Endpoints principais
- `GET /services`
- `GET /professionals?serviceId=&date=YYYY-MM-DD`
- `GET /availability?professionalId=&serviceId=&date=YYYY-MM-DD&tz=America/Sao_Paulo`
- `POST /appointments`

Veja o código em `src/` (controllers, services, routes, utils).
