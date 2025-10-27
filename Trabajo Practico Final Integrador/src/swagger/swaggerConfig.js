
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - PROGIII Reservas de Salones Infantiles",
      version: "1.0.0",
      description:
        "Documentación de la API REST desarrollada para el Trabajo Final Integrador de Programación III (UNER).",
      contact: { name: "Franco Ñaña", email: "franconana3@gmail.com" },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            usuario_id: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Franco" },
            apellido: { type: "string", example: "Ñaña" },
            nombre_usuario: { type: "string", example: "franconana" },
            tipo_usuario: { type: "integer", example: 3 },
            celular: { type: "string", example: "3411234567" },
            foto: { type: "string", example: "https://example.com/foto.jpg" },
            activo: { type: "boolean", example: true },
          },
        },
        Salon: {
          type: "object",
          properties: {
            salon_id: { type: "integer", example: 1 },
            titulo: { type: "string", example: "Salón Fiesta Feliz" },
            direccion: { type: "string", example: "Av. San Martín 1234" },
            latitud: { type: "number", example: -31.7325 },
            longitud: { type: "number", example: -60.5175 },
            capacidad: { type: "integer", example: 50 },
            importe: { type: "number", example: 15000.0 },
            activo: { type: "boolean", example: true },
          },
        },
        Turno: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            fecha: { type: "string", format: "date", example: "2025-11-03" },
            hora: { type: "string", example: "14:30" },
            salon_id: { type: "integer", example: 3 },
            servicio_id: { type: "integer", example: 5 },
            cliente_email: {
              type: "string",
              format: "email",
              example: "cliente@correo.com",
            },
            estado: {
              type: "string",
              enum: ["pendiente", "confirmado", "cancelado"],
              example: "pendiente",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
          required: [
            "fecha",
            "hora",
            "salon_id",
            "servicio_id",
            "cliente_email",
          ],
        },
        TurnoCreate: {
          type: "object",
          properties: {
            fecha: { type: "string", format: "date" },
            hora: { type: "string" },
            salon_id: { type: "integer" },
            servicio_id: { type: "integer" },
            cliente_email: { type: "string", format: "email" },
          },
          required: [
            "fecha",
            "hora",
            "salon_id",
            "servicio_id",
            "cliente_email",
          ],
        },
        TurnoUpdate: {
          type: "object",
          properties: {
            fecha: { type: "string", format: "date" },
            hora: { type: "string" },
            salon_id: { type: "integer" },
            servicio_id: { type: "integer" },
            cliente_email: { type: "string", format: "email" },
            estado: {
              type: "string",
              enum: ["pendiente", "confirmado", "cancelado"],
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.resolve("./src/v1/rutas/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
