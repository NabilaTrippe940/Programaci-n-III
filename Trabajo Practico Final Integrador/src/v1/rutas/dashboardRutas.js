//Src/V1/Rutas/DashboardRutas.js
import express from "express";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";
import dashboardControlador from "../../controladores/dashboardControlador.js";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints del panel de control (solo administradores y empleados)
 */
/**
 * @swagger
 * /api/v1/dashboard/resumen:
 *   get:
 *     summary: Obtener resumen numérico del sistema
 *     tags: [Dashboard]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Resumen general del sistema
 */
router.get(
  "/resumen",
  authenticateJWT,
  permit(1, 2),
  dashboardControlador.obtenerResumen
);

/**
 * @swagger
 * /api/v1/dashboard/graficos:
 *   get:
 *     summary: Obtener datos para gráficos
 *     tags: [Dashboard]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Datos para gráficos
 */
router.get(
  "/graficos",
  authenticateJWT,
  permit(1, 2),
  dashboardControlador.obtenerGraficos
);

export default router;