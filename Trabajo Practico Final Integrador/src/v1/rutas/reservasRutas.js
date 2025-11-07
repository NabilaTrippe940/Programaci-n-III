//Src/V1/Rutas/ReservasRutas.js
import express from "express";
import { param, body, validationResult } from "express-validator";
import ReservasControlador from "../../controladores/reservasControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";

const router = express.Router();
const reservasControlador = new ReservasControlador();

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtener todas las reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: No autorizado
 */
router.get("/", authenticateJWT, permit(1, 2, 3), (req, res) =>
  reservasControlador.buscarReservas(req, res)
);

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Reserva no encontrada
 *       401:
 *         description: No autorizado
 */
router.get(
  "/:id",
  authenticateJWT,
  permit(1, 2, 3),
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty())
      return res.status(400).json({ ok: false, errores: errores.array() });
    reservasControlador.buscarReservasPorId(req, res);
  }
);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevaReserva'
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post(
  "/",
  authenticateJWT,
  permit(1, 3),
  [
    body("fecha_reserva").notEmpty().withMessage("La fecha de reserva es obligatoria"),
    body("salon_id").isInt({ min: 1 }).withMessage("El ID de salón debe ser válido"),
    body("turno_id").isInt({ min: 1 }).withMessage("El ID de turno debe ser válido"),
    body("tematica").notEmpty().withMessage("La temática es obligatoria"),
    body("importe_total").isFloat({ min: 0 }).withMessage("El importe total debe ser positivo"),
  ],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty())
      return res.status(400).json({ ok: false, errores: errores.array() });
    reservasControlador.crearReservas(req, res);
  }
);

/**
 * @swagger
 * /reservas:
 *   put:
 *     summary: Modificar una reserva existente
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModificarReserva'
 *     responses:
 *       200:
 *         description: Reserva modificada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos
 *       401:
 *         description: No autorizado
 */
router.put(
  "/",
  authenticateJWT,
  permit(1),
  [
    body("reserva_id").isInt({ min: 1 }).withMessage("El ID de la reserva es obligatorio"),
    body("fecha_reserva").optional().isISO8601().withMessage("Fecha inválida"),
    body("turno_id").optional().isInt({ min: 1 }).withMessage("ID de turno inválido"),
    body("tematica").optional().isString().withMessage("Temática inválida"),
    body("importe_total").optional().isFloat({ min: 0 }).withMessage("Importe inválido"),
  ],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty())
      return res.status(400).json({ ok: false, errores: errores.array() });
    reservasControlador.modificarReservas(req, res);
  }
);

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Eliminar una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a eliminar
 *     responses:
 *       200:
 *         description: Reserva eliminada correctamente
 *       400:
 *         description: ID inválido
 *       403:
 *         description: No tienes permisos
 *       401:
 *         description: No autorizado
 */
router.delete(
  "/:id",
  authenticateJWT,
  permit(1),
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty())
      return res.status(400).json({ ok: false, errores: errores.array() });
    reservasControlador.eliminarReservas(req, res);
  }
);

/**
 * @swagger
 * /reservas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 estadisticas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes:
 *                         type: integer
 *                         example: 10
 *                       cantidad_reservas:
 *                         type: integer
 *                         example: 12
 *                       ingresos:
 *                         type: number
 *                         example: 150000
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  "/estadisticas",
  authenticateJWT,
  permit(1),
  (req, res) => reservasControlador.obtenerEstadisticas(req, res)
);

/**
 * @swagger
 * /reservas/reportes/pdf:
 *   get:
 *     summary: Generar PDF con reservas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  "/reportes/pdf",
  authenticateJWT,
  permit(1),
  (req, res) => reservasControlador.generarPDFReservas(req, res)
);

export default router;