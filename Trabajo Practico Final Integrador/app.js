//App.js
import express from "express";

import salonesRutas from "./src/v1/rutas/salonesRutas.js";
import authRutas from './src/v1/rutas/authRutas.js';
import reservasRutas from "./src/v1/rutas/reservasRutas.js";
import serviciosRutas from './src/v1/rutas/serviciosRutas.js';
import turnosRutas from './src/v1/rutas/turnosRutas.js';

import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from "./src/swagger/swaggerConfig.js";

const app = express();

app.use(express.json());

// Swagger montado en /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Estado del servidor
app.get("/estado", (req, res) => {
  res.json({ ok: true, mensaje: "SERVIDOR EN FUNCIONAMIENTO..." });
});

// Rutas de la API
app.use("/api/v1/salones", salonesRutas);
app.use("/api/v1/reservas", reservasRutas);
app.use("/api/v1/auth", authRutas);
app.use('/api/v1/servicios', serviciosRutas);
app.use('/api/v1/turnos', turnosRutas);

export default app;