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
router.get('/', authenticateJWT, async (req, res) => serviciosControlador.buscarServicios(req, res));

// GET by ID (solo admin o empleado)
router.get('/:id', authenticateJWT, permit(1,2), [param('id').isInt({ min: 1 })], manejarValidacion, async (req, res) => {
  serviciosControlador.buscarServicioPorId(req, res);
});

// POST (crear) solo admin/empleado
router.post('/', authenticateJWT, permit(1,2), 
  [
    body('descripcion').notEmpty().withMessage('Descripcion es obligatoria'),
    body('importe').isFloat({ min: 0 }).withMessage('Importe debe ser positivo'),
  ], 
  manejarValidacion, 
  async (req, res) => serviciosControlador.crearServicio(req, res)
);

// PUT (modificar) solo admin/empleado
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
router.delete('/:id', authenticateJWT, permit(1,2), [param('id').isInt({ min: 1 })], manejarValidacion, async (req, res) => {
  serviciosControlador.eliminarServicio(req, res);
});

export default router;