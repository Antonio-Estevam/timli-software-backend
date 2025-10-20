# ✂️ Barbearia Backend API

**Versão:** 1.0.0  
**Stack:** Node.js 20 · TypeScript · Express · Prisma ORM · PostgreSQL  
**Arquitetura:** MVC  
**Documentação da API:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## 📘 Sumário
1. Visão geral
2. Arquitetura do projeto
3. Configuração do ambiente
4. Scripts NPM
5. Banco de dados e Prisma
6. Fluxo da aplicação
7. Endpoints da API
8. Lógica de disponibilidade e agendamento
9. Padrões de código e contribuições
10. Swagger / Documentação técnica
11. Boas práticas e próximos passos

---

## 🔍 Visão geral

API responsável por gerenciar agendamentos de horários para uma barbearia, permitindo que clientes escolham serviços, visualizem profissionais e realizem agendamentos sem sobreposições de horários.

### Principais funcionalidades
- Listar serviços
- Listar profissionais e horários
- Calcular disponibilidade dinâmica (baseada na duração do serviço)
- Criar agendamentos com validação de conflito
- Suporte a fuso horário (luxon)
- Documentação Swagger (/api-docs)

---

## 🧩 Arquitetura do projeto

```
src/
├── controllers/
├── services/
├── routes/
├── utils/
├── docs/
├── prisma/
└── server.ts
```

---

## ⚙️ Configuração do ambiente

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

---

## 🧰 Scripts NPM

| Comando | Descrição |
|----------|------------|
| npm run dev | Inicia o servidor |
| npm run build | Compila TypeScript |
| npm start | Executa versão compilada |
| npx prisma studio | Interface do Prisma |
| npm run prisma:seed | Popula o banco |

---

## 🗄️ Banco de dados e Prisma

Modelo base:
```
Service          (id, name, durationMin, price)
Professional     (id, name)
ProfessionalService (serviceId, professionalId)
Schedule         (id, professionalId, dayOfWeek, startTime, endTime)
Appointment      (id, professionalId, serviceId, clientName, clientPhone, date, time)
```

---

## 🧭 Fluxo da aplicação

1. GET /services → cliente escolhe serviço  
2. GET /professionals → escolhe profissional  
3. GET /availability → verifica horários livres  
4. POST /appointments → cria agendamento

---

## 🚀 Endpoints principais

| Método | Endpoint | Descrição |
|---------|-----------|-----------|
| GET | /services | Lista serviços |
| GET | /professionals | Lista profissionais |
| GET | /availability | Mostra horários disponíveis |
| POST | /appointments | Cria agendamento |
| GET | /api-docs | Swagger UI |

---

## 🧠 Lógica de disponibilidade e agendamento

- **Slots dinâmicos:** gerados conforme duração do serviço.  
- **Bloqueio de sobreposição:** valida intervalos `[inicio, fim)` para evitar conflitos.  
- **Fuso horário:** ajustável via parâmetro `tz` (padrão `America/Sao_Paulo`).

---

## 💻 Swagger / Documentação técnica

Acesse: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

Local: `src/docs/swagger.ts`  
Bibliotecas: `swagger-jsdoc` + `swagger-ui-express`

---

## 🧑‍💻 Padrões de código e contribuições

- Código em TypeScript, nomenclatura em inglês  
- Controllers: apenas orquestram requests/responses  
- Services: contêm a lógica de negócio  
- Commits padronizados (ex: `feat: adiciona cálculo de disponibilidade`)  
- PRs com descrição clara das alterações

---

## 🧱 Boas práticas e próximos passos
- Autenticação JWT  
- Testes automatizados (Jest + Supertest)  
- Dashboard administrativo  
- Notificações (e-mail/SMS)

---
