# 💈 Sistema de Agendamento para Barbearia

Este projeto é um sistema completo de **agendamento de horários para barbearias**, desenvolvido em **Node.js + TypeScript + Prisma + PostgreSQL** no backend, e **React.js** no frontend.

O objetivo é permitir que **clientes agendem serviços**, enquanto **profissionais e administradores** gerenciam seus atendimentos, mantendo uma arquitetura escalável e comercializável.

---

## 🧠 Visão Geral do Sistema

O sistema possui **dois tipos principais de acesso**:

1. **Usuários (Users)**  
   - `ADMIN` → gerencia serviços, profissionais e agendamentos gerais  
   - `PROFESSIONAL` → realiza atendimentos, visualiza agenda pessoal  

2. **Clientes (Clients)**  
   - Fazem login e agendam serviços com profissionais disponíveis

---

## 🧩 Estrutura do Banco (Prisma Schema — Conceitual)

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relacionamento com Professional
  professional Professional?

  // Relacionamento com agendamentos (como profissional)
  appointments Appointment[] @relation("ProfessionalAppointments")
}

enum UserRole {
  ADMIN
  PROFESSIONAL
}

model Professional {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user        User       @relation(fields: [userId], references: [id])
  appointments Appointment[] @relation("ProfessionalAppointments")
}

model Client {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  appointments Appointment[] @relation("ClientAppointments")
}

model Service {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  duration    Int      // minutos
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  appointments Appointment[]
}

model Appointment {
  id             Int      @id @default(autoincrement())
  clientId       Int
  professionalId Int
  serviceId      Int
  date           DateTime
  duration       Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  client       Client       @relation("ClientAppointments", fields: [clientId], references: [id])
  professional User         @relation("ProfessionalAppointments", fields: [professionalId], references: [id])
  service      Service      @relation(fields: [serviceId], references: [id])
}
```

---

## 🔐 Fluxo de Autenticação

### 🔹 Cliente (`Client`)
**Fluxo:**
1. Cliente se cadastra em `/auth/client/register`
2. Faz login em `/auth/client/login`
3. Recebe token JWT com payload:
   ```json
   { "id": 3, "role": "CLIENT" }
   ```
4. Usa o token para acessar rotas protegidas:
   - `POST /appointments` → criar agendamento
   - `GET /appointments/client` → listar agendamentos

**Middleware usado:**  
`authenticateClient`

---

### 🔹 Usuário (`User`)
**Fluxo:**
1. Admin cria um usuário via `/auth/user/register`  
   (role = `PROFESSIONAL` ou `ADMIN`)
2. Usuário faz login em `/auth/user/login`
3. Recebe token JWT:
   ```json
   { "id": 1, "role": "PROFESSIONAL" }
   ```
4. Usa o token para acessar rotas:
   - `GET /appointments/day` → agendamentos do dia
   - `GET /services` → listar serviços
   - `POST /services` → criar serviços (somente ADMIN)

**Middlewares usados:**  
`authenticateUser`, `authorize('ADMIN')`, `authorize('PROFESSIONAL')`

---

## 🔄 Fluxo de Negócio (Agendamento)

1. **Cliente logado** → acessa lista de serviços (`GET /services`)  
2. Escolhe um serviço → sistema calcula **slots disponíveis** com base na duração e agenda do profissional  
3. Envia:
   ```json
   {
     "professionalId": 2,
     "serviceId": 1,
     "date": "2025-11-13T14:00:00Z"
   }
   ```
4. **Validações no backend:**
   - Cliente autenticado
   - Profissional existe e está livre
   - Não há sobreposição de horários
5. Se válido → cria registro em `Appointment`

---

## 🧱 Arquitetura (MVC)

| Camada | Pasta | Responsabilidade |
|--------|--------|------------------|
| **Controller** | `/controllers` | Recebe requisições HTTP |
| **Service** | `/services` | Regras de negócio, autenticação, etc |
| **Model (ORM)** | `/prisma/schema.prisma` | Estrutura e relações do banco |
| **Middleware** | `/middlewares/authMiddleware.ts` | Autenticação e autorização |
| **Routes** | `/routes` | Mapeamento dos endpoints |
| **Config** | `/config` | JWT e variáveis de ambiente |

---

## 🧭 Roadmap do Projeto

| Fase | Tarefa | Descrição |
|------|---------|-----------|
| ✅ Fase 1 | **Autenticação e Relacionamentos** | Separação entre User, Client e Professional |
| 🚧 Fase 2 | **Dashboard Profissional** | Exibir agenda diária |
| 🚧 Fase 3 | **Painel do Cliente** | Histórico e cancelamento |
| 🚧 Fase 4 | **Painel do Admin** | Gerir serviços, usuários e estatísticas |
| 🚧 Fase 5 | **Notificações** | E-mail / WhatsApp / SMS |
| 🚧 Fase 6 | **Pagamentos Online** | Stripe / Pix |
| 🚧 Fase 7 | **Deploy Comercial** | Docker + Render/Vercel + SSL |

---

## 💡 Tecnologias Utilizadas

- **Node.js v20+**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Express.js**
- **JWT (jsonwebtoken)**
- **bcryptjs**
- **React.js (frontend)**

---

## 🧰 Scripts de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar migrations
npx prisma migrate dev

# Executar o servidor
npm run dev

# Gerar build de produção
npm run build
```

---

## 📜 Licença

Este projeto está sob a licença **MIT** — sinta-se livre para utilizar e modificar.

---

**Desenvolvido com ❤️ para barbearias que querem um sistema moderno, seguro e escalável.**
