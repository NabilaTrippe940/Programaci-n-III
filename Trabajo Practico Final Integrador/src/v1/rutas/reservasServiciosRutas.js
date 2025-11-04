//Src/V1/Rutas/ReservasServiciosRutas.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import ReservasServiciosControlador from '../../controladores/reservasServiciosControlador.js';
import { authenticateJWT } from '../../middlewares/authenticateJWT.js';
import { permit } from '../../middlewares/roles.js';

const router = express.Router();
const controlador = new ReservasServiciosControlador();

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errores: errors.array() });
  next();
};


/**
 * @swagger
 * /reservas-servicios/{reserva_id}:
 *   get:
 *     summary: Listar servicios asociados a una reserva
 *     tags:
 *       - ReservasServicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Lista de servicios asociados a la reserva
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/:reserva_id',
  authenticateJWT,
  permit(1,2,3),
  [ param('reserva_id').isInt({ min: 1 }).withMessage('reserva_id inválido') ],
  manejarValidacion,
  (req, res) => controlador.listarServiciosPorReserva(req, res)
);

/**
 * @swagger
 * /reservas-servicios:
 *   post:
 *     summary: Agregar un servicio a una reserva
 *     tags:
 *       - ReservasServicios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reserva_id
 *               - servicio_id
 *               - importe
 *             properties:
 *               reserva_id:
 *                 type: integer
 *               servicio_id:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       201:
 *         description: Servicio agregado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/',
  authenticateJWT,
  permit(1,2),
  [
    body('reserva_id').isInt({ min: 1 }).withMessage('reserva_id inválido'),
    body('servicio_id').isInt({ min: 1 }).withMessage('servicio_id inválido'),
    body('importe').isFloat({ min: 0 }).withMessage('importe inválido'),
  ],
  manejarValidacion,
  (req, res) => controlador.agregarServicioAReserva(req, res)
);

/**
 * @swagger
 * /reservas-servicios/{reserva_servicio_id}:
 *   delete:
 *     summary: Eliminar un servicio de reserva por ID
 *     tags:
 *       - ReservasServicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserva_servicio_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio de reserva a eliminar
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete(
  '/:reserva_servicio_id',
  authenticateJWT,
  permit(1,2),
  [ param('reserva_servicio_id').isInt({ min: 1 }).withMessage('ID inválido') ],
  manejarValidacion,
  (req, res) => controlador.eliminarServicioDeReserva(req, res)
);

export default router;