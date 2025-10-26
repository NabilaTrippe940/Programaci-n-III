import express from 'express';
import { body, param, validationResult } from 'express-validator';
import ServiciosControlador from '../../controladores/serviciosControlador.js';
import { authenticateJWT } from '../../middlewares/authenticateJWT.js';
import { permit } from '../../middlewares/roles.js';

const router = express.Router();
const serviciosControlador = new ServiciosControlador();

const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errores: errors.array() });
  next();
};

// GET all (usuarios tipo 3 pueden acceder)

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtener todos los servicios activos
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 servicios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Servicio'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateJWT, async (req, res) => serviciosControlador.buscarServicios(req, res));

// GET by ID (solo admin o empleado)

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 servicio:
 *                   $ref: '#/components/schemas/Servicio'
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */

router.get('/:id', authenticateJWT, permit(1,2), [param('id').isInt({ min: 1 })], manejarValidacion, async (req, res) => {
  serviciosControlador.buscarServicioPorId(req, res);
});

// POST (crear) solo admin/empleado

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - importe
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Decoración temática"
 *               importe:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Servicio creado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       500:
 *         description: Error del servidor
 */

router.post('/', authenticateJWT, permit(1,2), 
  [
    body('descripcion').notEmpty().withMessage('Descripcion es obligatoria'),
    body('importe').isFloat({ min: 0 }).withMessage('Importe debe ser positivo'),
  ], 
  manejarValidacion, 
  async (req, res) => serviciosControlador.crearServicio(req, res)
);

// PUT (modificar) solo admin/empleado

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Modificar un servicio existente
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Servicio modificado con éxito
 *       400:
 *         description: ID inválido o datos incorrectos
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */

router.put(
  '/:id',
  authenticateJWT,
  permit(1,2),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('descripcion').optional().isString().withMessage('Descripcion inválida'),
    body('importe').optional().isFloat({ min: 0 }).withMessage('Importe inválido'),
    body('activo').optional().isBoolean().withMessage('Activo debe ser booleano'),
  ],
  manejarValidacion,
  (req, res) => serviciosControlador.modificarServicio(req, res)
);

// DELETE (soft delete) solo admin/empleado

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Eliminar un servicio (soft delete)
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio eliminado con éxito
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */

router.delete('/:id', authenticateJWT, permit(1,2), [param('id').isInt({ min: 1 })], manejarValidacion, async (req, res) => {
  serviciosControlador.eliminarServicio(req, res);
});

export default router;