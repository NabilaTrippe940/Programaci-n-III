//Src/V1/Rutas/SalonesRutas.js
import express from "express";
import { param, body, validationResult } from "express-validator";
import SalonesControlador from "../../controladores/salonesControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";

const router = express.Router();
const salonesControlador = new SalonesControlador();

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtener todos los salones
 *     tags: [Salones]
 *     responses:
 *       200:
 *         description: Lista de salones obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   salon_id: { type: integer, example: 1 }
 *                   titulo: { type: string, example: "Salón Fiesta Feliz" }
 *                   direccion: { type: string, example: "Calle Falsa 123" }
 *                   capacidad: { type: integer, example: 50 }
 *                   latitud: { type: number, example: -31.4167 }
 *                   longitud: { type: number, example: -64.1833 }
 *                   importe: { type: number, example: 15000.0 }
 *                   activo: { type: boolean, example: true }
 *       500: { description: "Error al obtener los salones" }
 */
router.get("/", (req, res) => salonesControlador.buscarSalones(req, res));

/**
 * @swagger
 * /salones/{id}:
 *   get:
 *     summary: Obtener un salón por su ID
 *     tags: [Salones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del salón
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200: { description: "Salón encontrado correctamente" }
 *       400: { description: "ID inválido" }
 *       404: { description: "Salón no encontrado" }
 */
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    salonesControlador.buscarSalonesPorId(req, res);
  }
);

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crear un nuevo salón (solo empleados o administradores)
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, direccion, capacidad, latitud, longitud, importe]
 *             properties:
 *               titulo: { type: string, example: "Salón Fiesta Feliz" }
 *               direccion: { type: string, example: "Calle Falsa 123" }
 *               capacidad: { type: integer, example: 50 }
 *               latitud: { type: number, example: -31.4167 }
 *               longitud: { type: number, example: -64.1833 }
 *               importe: { type: number, example: 15000.0 }
 *     responses:
 *       201: { description: "Salón creado correctamente" }
 *       400: { description: "Errores de validación" }
 *       403: { description: "No autorizado" }
 *       500: { description: "Error al crear el salón" }
 */
router.post(
  "/",
  authenticateJWT,
  permit(1, 2),
  [
    body("titulo").notEmpty().withMessage("El titulo es obligatorio"),
    body("direccion").notEmpty().withMessage("La dirección es obligatoria"),
    body("capacidad").isInt({ min: 1 }).withMessage("Capacidad debe ser un número entero positivo"),
    body("latitud").isFloat({ min: -90, max: 90 }).withMessage("Latitud inválida"),
    body("longitud").isFloat({ min: -180, max: 180 }).withMessage("Longitud inválida"),
    body("importe").isFloat({ min: 0 }).withMessage("Importe debe ser un número positivo"),
  ],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    salonesControlador.crearSalones(req, res);
  }
);

/**
 * @swagger
 * /salones:
 *   put:
 *     summary: Modificar un salón existente (solo empleados o administradores)
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [salon_id]
 *             properties:
 *               salon_id: { type: integer, example: 1 }
 *               titulo: { type: string, example: "Salón Fiesta Renovado" }
 *               direccion: { type: string, example: "Av. Siempre Viva 742" }
 *               capacidad: { type: integer, example: 60 }
 *               latitud: { type: number, example: -31.42 }
 *               longitud: { type: number, example: -64.18 }
 *               importe: { type: number, example: 18000.0 }
 *     responses:
 *       200: { description: "Salón modificado correctamente" }
 *       400: { description: "Errores de validación" }
 *       404: { description: "Salón no encontrado" }
 *       403: { description: "No autorizado" }
 */
router.put(
  "/",
  authenticateJWT,
  permit(1, 2),
  [
    body("salon_id").isInt({ min: 1 }).withMessage("ID del salón inválido"),
    body("titulo").optional().isString().withMessage("Titulo inválido"),
    body("direccion").optional().isString().withMessage("Dirección inválida"),
    body("capacidad").optional().isInt({ min: 1 }).withMessage("Capacidad inválida"),
    body("latitud").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitud inválida"),
    body("longitud").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitud inválida"),
    body("importe").optional().isFloat({ min: 0 }).withMessage("Importe debe ser un número positivo"),
  ],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    salonesControlador.modificarSalones(req, res);
  }
);

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Eliminar un salón por ID (solo empleados o administradores)
 *     tags: [Salones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del salón a eliminar
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200: { description: "Salón eliminado correctamente" }
 *       404: { description: "Salón no encontrado" }
 *       403: { description: "No autorizado" }
 */
router.delete(
  "/:id",
  authenticateJWT,
  permit(1, 2),
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    salonesControlador.eliminarSalones(req, res);
  }
);

export default router;