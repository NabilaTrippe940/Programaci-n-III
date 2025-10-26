//Src/V1/Rutas/AuthRutas.js
import express from "express";
import { body, param, validationResult } from "express-validator";
import AuthControlador from "../../controladores/authControlador.js";
import { authenticateJWT } from "../../middlewares/authenticateJWT.js";
import { permit } from "../../middlewares/roles.js";

const router = express.Router();
const authControlador = new AuthControlador();

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

// -------------------- REGISTER --------------------
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
 *             required: [nombre, apellido, nombre_usuario, contrasenia]
 *             properties:
 *               nombre: { type: string, example: "Franco" }
 *               apellido: { type: string, example: "Ñaña" }
 *               nombre_usuario: { type: string, example: "francona" }
 *               contrasenia: { type: string, example: "123456" }
 *               tipo_usuario: { type: integer, example: 3 }
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
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
    body("apellido").notEmpty().withMessage("El apellido es obligatorio").trim(),
    body("nombre_usuario").notEmpty().withMessage("El nombre de usuario es obligatorio").trim(),
    body("contrasenia").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("tipo_usuario").optional().isInt({ min: 1, max: 3 }).withMessage("Tipo de usuario inválido"),
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
 *             required: [nombre_usuario, contrasenia]
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
    body("nombre_usuario").notEmpty().withMessage("El nombre de usuario es obligatorio").trim(),
    body("contrasenia").notEmpty().withMessage("La contraseña es obligatoria"),
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
 * /auth/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (solo admin o empleado)
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
  permit(1, 2),
  async (req, res) => {
    try {
      await authControlador.listarUsuarios(req, res);
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: err.message });
    }
  }
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
 *       - name: id
 *         in: path
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
  [param("id").isInt().withMessage("ID de usuario inválido")],
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
 *       - name: id
 *         in: path
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
 *               tipo_usuario: { type: integer, enum: [1,2,3] }
 *               celular: { type: string }
 *               foto: { type: string }
 *               activo: { type: integer, enum: [0, 1], example: 1 }
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
    param("id").isInt().withMessage("ID de usuario inválido"),
    body("nombre").optional().isString().trim(),
    body("apellido").optional().isString().trim(),
    body("nombre_usuario").optional().isString().trim(),
    body("contrasenia").optional().isLength({ min: 6 }),
    body("tipo_usuario").optional().isInt({ min: 1, max: 3 }),
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
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *         description: ID del usuario a desactivar
 *     responses:
 *       200: { description: "Usuario desactivado correctamente" }
 *       403: { description: "No autorizado" }
 *       404: { description: "Usuario no encontrado" }
 */
router.delete(
  "/usuarios/:id",
  authenticateJWT,
  permit(1),
  [param("id").isInt().withMessage("ID de usuario inválido")],
  manejarValidacion,
  async (req, res) => {
    try {
      const rows = await authControlador.eliminarUsuario(req.params.id);
      if (rows) res.json({ ok: true, mensaje: "Usuario desactivado correctamente" });
      else res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    } catch (err) {
      res.status(500).json({ ok: false, mensaje: err.message });
    }
  }
);

/**
 * @swagger
 * /auth/admin/crear-usuario:
 *   post:
 *     summary: Crear un nuevo usuario (solo admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario]
 *             properties:
 *               nombre: { type: string }
 *               apellido: { type: string }
 *               nombre_usuario: { type: string }
 *               contrasenia: { type: string }
 *               tipo_usuario: { type: integer, enum: [1,2,3] }
 *               celular: { type: string }
 *               foto: { type: string }
 *     responses:
 *       201: { description: "Usuario creado correctamente" }
 *       400: { description: "Errores de validación" }
 *       403: { description: "No autorizado" }
 *       409: { description: "Usuario ya existe" }
 */
router.post(
  "/admin/crear-usuario",
  authenticateJWT,
  permit(1), // solo admin
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
    body("apellido").notEmpty().withMessage("El apellido es obligatorio").trim(),
    body("nombre_usuario").notEmpty().withMessage("El nombre de usuario es obligatorio").trim(),
    body("contrasenia").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("tipo_usuario").isInt({ min: 1, max: 3 }).withMessage("Tipo de usuario inválido"),
    body("celular").optional().isString(),
    body("foto").optional().isString(),
  ],
  manejarValidacion,
  (req, res) => authControlador.crearUsuarioAdmin(req, res)
);

export default router;