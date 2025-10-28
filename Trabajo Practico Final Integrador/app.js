//App.js
import express from "express";
import salonesRutas from "./src/v1/rutas/salonesRutas.js";
import authRutas from './src/v1/rutas/authRutas.js';
import reservaRutas from "./reservas.js";
import serviciosRutas from './src/v1/rutas/serviciosRutas.js';



import { swaggerSpec, swaggerUi } from "./src/swagger/swaggerConfig.js";


const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/estado", (req, res) => {
  res.json({ ok: true, mensaje: "SERVIDOR EN FUNCIONAMIENTO..." });
});

app.use("/api/v1/salones", salonesRutas);
app.use("/api/v1/notificacion", reservaRutas);
app.use("/api/v1/auth", authRutas);
app.use('/api/v1/servicios', serviciosRutas);


export default app;