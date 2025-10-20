import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Agendamento - Barbearia",
      version: "1.0.0",
      description:
        "Documentação da API para o sistema de agendamento de horários em uma barbearia.\n\nEndpoints para serviços, profissionais, disponibilidade e agendamentos.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Servidor Local",
      },
    ],
    components: {
      schemas: {
        Service: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Corte Masculino" },
            durationMin: { type: "integer", example: 30 },
            price: { type: "number", example: 45.0 },
          },
        },
        Professional: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "João Barber" },
          },
        },
        AvailabilitySlot: {
          type: "object",
          properties: {
            time: { type: "string", example: "10:30" },
            available: { type: "boolean", example: true },
          },
        },
        AppointmentRequest: {
          type: "object",
          required: [
            "clientName",
            "clientPhone",
            "serviceId",
            "professionalId",
            "date",
            "time",
          ],
          properties: {
            clientName: { type: "string", example: "Lucas Silva" },
            clientPhone: { type: "string", example: "11999999999" },
            serviceId: { type: "integer", example: 1 },
            professionalId: { type: "integer", example: 2 },
            date: { type: "string", example: "2025-10-10" },
            time: { type: "string", example: "10:00" },
          },
        },
        AppointmentResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            message: {
              type: "string",
              example: "Agendamento criado com sucesso",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Horário indisponível" },
          },
        },
      },
    },
    paths: {
      "/api/services": {
        get: {
          tags: ["Serviços"],
          summary: "Lista todos os serviços disponíveis",
          responses: {
            200: {
              description: "Lista de serviços retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Service" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/professionals": {
        get: {
          tags: ["Profissionais"],
          summary:
            "Lista profissionais disponíveis para um serviço em uma data específica",
          parameters: [
            {
              name: "serviceId",
              in: "query",
              required: true,
              schema: { type: "integer" },
              description: "ID do serviço desejado",
            },
            {
              name: "date",
              in: "query",
              required: true,
              schema: { type: "string", format: "date" },
              description: "Data desejada (YYYY-MM-DD)",
            },
          ],
          responses: {
            200: {
              description: "Profissionais disponíveis retornados com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Professional" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/availability": {
        get: {
          tags: ["Disponibilidade"],
          summary:
            "Retorna horários disponíveis para um profissional e serviço em uma data",
          parameters: [
            {
              name: "professionalId",
              in: "query",
              required: true,
              schema: { type: "integer" },
              description: "ID do profissional",
            },
            {
              name: "serviceId",
              in: "query",
              required: true,
              schema: { type: "integer" },
              description: "ID do serviço",
            },
            {
              name: "date",
              in: "query",
              required: true,
              schema: { type: "string", format: "date" },
              description: "Data desejada (YYYY-MM-DD)",
            },
            {
              name: "tz",
              in: "query",
              required: false,
              schema: { type: "string" },
              description:
                "Fuso horário opcional (ex: America/Sao_Paulo). Padrão: UTC.",
            },
          ],
          responses: {
            200: {
              description: "Lista de horários disponíveis",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AvailabilitySlot" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/appointments": {
        post: {
          tags: ["Agendamentos"],
          summary: "Cria um novo agendamento",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Agendamento criado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AppointmentResponse" },
                },
              },
            },
            400: {
              description: "Erro de validação",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            409: {
              description: "Conflito de horário (já ocupado)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
  //apis: ["./src/routes/*.ts"], // Caminho para suas rotas
  
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger disponível em: http://localhost:4000/api-docs");
}
