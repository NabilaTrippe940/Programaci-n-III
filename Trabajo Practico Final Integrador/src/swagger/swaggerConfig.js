//Src/Swagger//SwaggerConfig.js
// src/swagger/swaggerConfig.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - PROGIII Reservas de Salones Infantiles",
      version: "1.0.0",
      description: "Documentación de la API REST desarrollada para el Trabajo Final Integrador de Programación III (UNER).",
      contact: { name: "Franco Ñaña", email: "franconana3@gmail.com" },
    },
    servers: [
      { url: "http://localhost:3000/api/v1", description: "Servidor local de desarrollo" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
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
            activo: { type: "boolean", example: true }
          }
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
            activo: { type: "boolean", example: true }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.resolve("./src/v1/rutas/*.js")]
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };