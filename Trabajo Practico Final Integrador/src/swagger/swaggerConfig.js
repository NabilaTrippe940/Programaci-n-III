//Src/Swagger//SwaggerConfig.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - PROGIII Reservas de Salones Infantiles",
      version: "1.0.0",
      description:
        "Documentación de la API REST desarrollada para el Trabajo Final Integrador de Programación III (UNER).",
      contact: {
        name: "Franco Ñaña",
        email: "franconana3@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/v1/rutas/*.js",
    "./reservas.js"
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };