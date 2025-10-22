//Src/V1/Rutas/AuthRutas.js
import express from "express";
import { body, param, validationResult } from "express-validator";
import AuthControlador from "../../controladores/authControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";

const router = express.Router();
const authControlador = new AuthControlador();

/**
 * Helper: centraliza respuesta de errores de express-validator
 */
const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errores: errors.array() });
  next();
};

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
 *     summary: Registrar un nuevo usuario
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
 *               - correo
 *             properties:
 *               nombre: { type: string, example: "Franco" }
 *               apellido: { type: string, example: "Ñaña" }
 *               nombre_usuario: { type: string, example: "francona" }
 *               contrasenia: { type: string, example: "123456" }
 *               tipo_usuario: { type: string, example: "cliente" }
 *               celular: { type: string, example: "123456789" }
 *               foto: { type: string, example: "url/foto.jpg" }
 *     responses:
 *       201: { description: "Usuario registrado correctamente" }
 *       400: { description: "Errores de validación" }
 *       409: { description: "Usuario ya registrado" }
 */
router.post(
  "/register",
  [
    body("nombre").notEmpty().withMessage("nombre requerido"),
    body("apellido").notEmpty().withMessage("apellido requerido"),
    body("nombre_usuario").notEmpty().withMessage("nombre_usuario requerido"),
    body("contrasenia").isLength({ min: 6 }).withMessage("contrasenia mínimo 6 caracteres"),
  ],
  manejarValidacion,
  (req, res) => authControlador.register(req, res)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener tokens
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
 *               nombre_usuario: { type: string, example: "francona" }
 *               contrasenia: { type: string, example: "123456" }
 *     responses:
 *       200: { description: "Inicio de sesión exitoso (devuelve accessToken y refreshToken)" }
 *       400: { description: "Errores de validación" }
 *       401: { description: "Credenciales inválidas" }
 */
router.post(
  "/login",
  [
    body("nombre_usuario").notEmpty().withMessage("nombre_usuario requerido"),
    body("contrasenia").notEmpty().withMessage("contrasenia requerido"),
  ],
  manejarValidacion,
  (req, res) => authControlador.login(req, res)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token con refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: "Nuevo accessToken" }
 *       401: { description: "Refresh token requerido" }
 *       403: { description: "Refresh token inválido o expirado" }
 */
router.post("/refresh", (req, res) => authControlador.refreshToken(req, res));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión (invalidar refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: "Sesión cerrada correctamente" }
 */
router.post("/logout", (req, res) => authControlador.logout(req, res));

/**
 * @swagger
 * /auth/usuarios:
 *   get:
 *     summary: Listar usuarios (solo admin o empleado)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Lista de usuarios" }
 *       403: { description: "No autorizado" }
 */
router.get(
  "/usuarios",
  authenticateJWT,
  permit("admin", "empleado"),
  (req, res) => authControlador.listarUsuarios ? authControlador.listarUsuarios(req, res) : res.status(501).json({ ok:false, mensaje:'listarUsuarios no implementado en controlador' })
);

/**
 * @swagger
 * /auth/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (propio o admin/empleado)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del usuario
 *     responses:
 *       200: { description: "Usuario obtenido correctamente" }
 *       403: { description: "Acceso denegado" }
 *       404: { description: "Usuario no encontrado" }
 */
router.get(
  "/usuarios/:id",
  authenticateJWT,
  [ param("id").isInt().withMessage("id debe ser entero") ],
  manejarValidacion,
  (req, res) => authControlador.obtenerUsuario(req, res)
);

/**
 * @swagger
 * /auth/usuarios/{id}:
 *   put:
 *     summary: Modificar usuario por ID (propio o admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               apellido: { type: string }
 *               nombre_usuario: { type: string }
 *               contrasenia: { type: string }
 *               tipo_usuario: { type: string }
 *               celular: { type: string }
 *               foto: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: "Usuario modificado correctamente" }
 *       400: { description: "Errores de validación" }
 *       403: { description: "No autorizado" }
 *       404: { description: "Usuario no encontrado" }
 */
router.put(
  "/usuarios/:id",
  authenticateJWT,
  [
    param("id").isInt().withMessage("id debe ser entero"),
    body("nombre").optional().isString(),
    body("apellido").optional().isString(),
    body("nombre_usuario").optional().isString(),
    body("contrasenia").optional().isLength({ min: 6 }).withMessage("contrasenia mínimo 6 caracteres"),
    body("tipo_usuario").optional().isIn(["admin","empleado","cliente"]),
    body("celular").optional().isString(),
    body("foto").optional().isString(),
    body("activo").optional().isBoolean(),
  ],
  manejarValidacion,
  (req, res) => authControlador.modificarUsuario(req, res)
);

/**
 * @swagger
 * /auth/usuarios/{id}:
 *   delete:
 *     summary: Desactivar (soft delete) un usuario (solo admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Usuario desactivado" }
 *       403: { description: "No autorizado" }
 */
router.delete(
  "/usuarios/:id",
  authenticateJWT,
  permit("admin"),
  (req, res) => authControlador.eliminarUsuario ? authControlador.eliminarUsuario(req, res) : res.status(501).json({ ok:false, mensaje:'eliminarUsuario no implementado en controlador' })
);

export default router;