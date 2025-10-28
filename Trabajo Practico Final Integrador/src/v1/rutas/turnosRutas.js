import express from 'express';
import { body, param, validationResult } from 'express-validator';
import TurnosControlador from '../../controladores/turnosControlador.js';
import { authenticateJWT } from '../../middlewares/authenticateJWT.js';
import { permit } from '../../middlewares/roles.js';

const router = express.Router();
const turnosControlador = new TurnosControlador();

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errores: errors.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Endpoints para la gestión de turnos
 */

/**
 * @swagger
 * /api/v1/turnos:
 *   get:
 *     summary: Obtener todos los turnos
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Turno'
 */
router.get('/', authenticateJWT, async (req, res) => turnosControlador.buscarTurnos(req, res));

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   get:
 *     summary: Obtener un turno por su ID
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del turno
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Turno'
 *       404:
 *         description: No se encontró el turno
 */
router.get(
  '/:id',
  authenticateJWT,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  manejarValidacion,
  async (req, res) => turnosControlador.buscarTurnoPorId(req, res)
);

/**
 * @swagger
 * /api/v1/turnos:
 *   post:
 *     summary: Crear un nuevo turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoCreate'
 *     responses:
 *       201:
 *         description: Turno creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Error de validación o datos incorrectos
 */
router.post(
  '/',
  authenticateJWT,
  permit(1, 2),
  [
    body('orden').isInt({ min: 1 }).withMessage('El orden es obligatorio y debe ser numérico.'),
    body('hora_desde').notEmpty().withMessage('La hora de inicio es obligatoria.'),
    body('hora_hasta').notEmpty().withMessage('La hora de fin es obligatoria.'),
  ],
  manejarValidacion,
  async (req, res) => turnosControlador.crearTurno(req, res)
);

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   put:
 *     summary: Modificar un turno existente
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del turno a modificar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoUpdate'
 *     responses:
 *       200:
 *         description: Turno modificado correctamente
 *       400:
 *         description: Error en la validación de datos
 *       404:
 *         description: No se encontró el turno
 */
router.put(
  '/:id',
  authenticateJWT,
  permit(1, 2),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('orden').optional().isInt({ min: 1 }),
    body('hora_desde').optional().isString(),
    body('hora_hasta').optional().isString(),
    body('activo').optional().isBoolean(),
  ],
  manejarValidacion,
  async (req, res) => turnosControlador.modificarTurno(req, res)
);

/**
 * @swagger
 * /api/v1/turnos/{id}:
 *   delete:
 *     summary: Eliminar un turno existente
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del turno a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno eliminado correctamente
 *       404:
 *         description: No se encontró el turno
 */
router.delete(
  '/:id',
  authenticateJWT,
  permit(1, 2),
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  manejarValidacion,
  async (req, res) => turnosControlador.eliminarTurno(req, res)
);

export default router;
