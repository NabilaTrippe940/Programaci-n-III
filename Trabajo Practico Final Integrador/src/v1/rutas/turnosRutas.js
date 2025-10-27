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

router.get('/', authenticateJWT, async (req, res) => turnosControlador.buscarTurnos(req, res));

router.get(
  '/:id',
  authenticateJWT,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  manejarValidacion,
  async (req, res) => turnosControlador.buscarTurnoPorId(req, res)
);

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

router.delete(
  '/:id',
  authenticateJWT,
  permit(1, 2),
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  manejarValidacion,
  async (req, res) => turnosControlador.eliminarTurno(req, res)
);

export default router;
