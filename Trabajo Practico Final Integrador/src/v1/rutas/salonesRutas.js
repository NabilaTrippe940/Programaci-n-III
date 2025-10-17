import express from "express";
import SalonesControlador from "../../controladores/salonesControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";

const router = express.Router();
const salonesControlador = new SalonesControlador();

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Endpoints para la gestión de salones infantiles
 */

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtener la lista de todos los salones
 *     tags: [Salones]
 *     responses:
 *       200:
 *         description: Lista de salones obtenida correctamente
 *       500:
 *         description: Error al obtener los salones
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
 *         description: ID del salón a buscar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salón encontrado
 *       404:
 *         description: Salón no encontrado
 */
router.get("/:id", (req, res) => salonesControlador.buscarSalonesPorId(req, res));

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crear un nuevo salón (solo empleados o admins)
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *     responses:
 *       201:
 *         description: Salón creado correctamente
 *       403:
 *         description: No autorizado
 */
router.post("/", authenticateJWT, permit(["empleado", "admin"]), (req, res) =>
  salonesControlador.crearSalones(req, res)
);

/**
 * @swagger
 * /salones:
 *   put:
 *     summary: Modificar un salón existente
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Salón modificado correctamente
 *       404:
 *         description: Salón no encontrado
 */
router.put("/", authenticateJWT, permit(["empleado", "admin"]), (req, res) =>
  salonesControlador.modificarSalones(req, res)
);

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Eliminar un salón por ID (soft delete)
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del salón a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salón eliminado correctamente
 *       404:
 *         description: Salón no encontrado
 */
router.delete("/:id", authenticateJWT, permit(["empleado", "admin"]), (req, res) =>
  salonesControlador.eliminarSalones(req, res)
);

export default router;
