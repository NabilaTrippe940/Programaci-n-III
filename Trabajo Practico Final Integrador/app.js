//App.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import salonesRutas from "./src/v1/rutas/salonesRutas.js";
import authRutas from "./src/v1/rutas/authRutas.js";
import reservasRutas from "./src/v1/rutas/reservasRutas.js";
import reservaNotificacion from "./reservas.js";
import serviciosRutas from "./src/v1/rutas/serviciosRutas.js";
import turnosRutas from "./src/v1/rutas/turnosRutas.js";
import reservasServiciosRutas from "./src/v1/rutas/reservasServiciosRutas.js";
import dashboardRutas from "./src/v1/rutas/dashboardRutas.js";

import { authenticateJWT } from "./src/middlewares/authenticateJWT.js";
import { permit } from "./src/middlewares/roles.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/swagger/swaggerConfig.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(express.static("src/public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/estado", (req, res) => {
  res.json({
    ok: true,
    mensaje: "SERVIDOR EN FUNCIONAMIENTO..."
  });
});

app.use("/api/v1/salones", salonesRutas);
app.use("/api/v1/reservas", reservasRutas);
app.use("/api/v1/notificacion", reservaNotificacion);
app.use("/api/v1/auth", authRutas);
app.use("/api/v1/servicios", serviciosRutas);
app.use("/api/v1/turnos", turnosRutas);
app.use("/api/v1/reservas-servicios", reservasServiciosRutas);
app.use("/api/v1/dashboard", dashboardRutas);

app.get("/dashboard", (req, res) => {
  res.sendFile(path.resolve("src/public/dashboard/index.html"));
});

export default app;