import express from "express";
import AuthControlador from "../../controladores/authControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";


const router = express.Router();
const authControlador = new AuthControlador();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *                 example: cliente
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos o usuario existente
 */
router.post("/register", (req, res) => authControlador.register(req, res));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión con nombre de usuario y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", (req, res) => authControlador.login(req, res));

/**
 * @swagger
//  * /auth/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna la información de un usuario según su ID. Requiere autenticación con token JWT.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token invalido o ausente
 */
router.get("/usuarios/:id", authenticateJWT, (req, res) =>
  authControlador.obtenerUsuario(req, res)
);

/**
 * @swagger
 * /auth/usuarios/{id}:
 *   put:
 *     summary: Modificar datos de un usuario por ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *               celular:
 *                 type: string
 *               foto:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario modificado correctamente
 *       400:
 *         description: Error en los datos enviados
 *       401:
 *         description: Token inválido
 */
router.put("/usuarios/:id", authenticateJWT, (req, res) =>
  authControlador.modificarUsuario(req, res)
);

export default router;