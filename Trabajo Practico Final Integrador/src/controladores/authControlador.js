//Src/Controladores/AuthControlador.js
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AuthServicio from "../servicios/authServicio.js";
import dotenv from "dotenv";

dotenv.config();

const REFRESH_TOKENS = new Set();
const authServicio = new AuthServicio();

export default class AuthControlador {
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errores: errors.array() });

    try {
      const existente = await authServicio.findByNombreUsuario(req.body.nombre_usuario);
      if (existente)
        return res.status(409).json({ ok: false, mensaje: "ERROR: El nombre de usuario ya existe." });

      const nuevo = await authServicio.createUser(req.body);

      res.status(201).json({ ok: true, mensaje: "Usuario registrado con éxito", usuario: nuevo });
    } catch (error) {
      console.error("ERROR", error);
      res.status(500).json({ ok: false, mensaje: "ERROR al registrar el usuario." });
    }
  }

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ ok: false, errores: errors.array() });

    const { nombre_usuario, contrasenia } = req.body;

    try {
      const user = await authServicio.findByNombreUsuario(nombre_usuario);
      if (!user) return res.status(404).json({ ok: false, mensaje: "ERROR: Usuario no encontrado." });

      const esValida = await bcrypt.compare(contrasenia, user.contrasenia);
      if (!esValida) 
        return res.status(401).json({ ok: false, mensaje: "ERROR: Contraseña incorrecta." });

      const accessToken = jwt.sign(
        { usuario_id: user.usuario_id, nombre_usuario: user.nombre_usuario, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "5m" }
      );

      const refreshToken = jwt.sign(
        { usuario_id: user.usuario_id, nombre_usuario: user.nombre_usuario },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      REFRESH_TOKENS.add(refreshToken);

      res.json({
        ok: true,
        mensaje: "Sesion iniciada con éxito.",
        accessToken,
        refreshToken,
        usuario: {
          usuario_id: user.usuario_id,
          nombre: user.nombre,
          apellido: user.apellido,
          tipo_usuario: user.tipo_usuario,
        },
      });
    } catch (error) {
      console.error("ERROR", error);
      res.status(500).json({ ok: false, mensaje: "ERROR al iniciar sesión." });
    }
  }

  async refreshToken(req, res) {
    const { token } = req.body;
    if (!token) return res.status(401).json({ ok: false, mensaje: "RefreshToken requerido." });
    if (!REFRESH_TOKENS.has(token)) 
      return res.status(403).json({ ok: false, mensaje: "RefreshToken inválido." });

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const nuevoAccessToken = jwt.sign(
        { usuario_id: decoded.usuario_id, nombre_usuario: decoded.nombre_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "5m" }
      );
      res.json({ ok: true, accessToken: nuevoAccessToken });
    } catch (err) {
      console.error("ERROR", err);
      res.status(403).json({ ok: false, mensaje: "RefreshToken inválido." });
    }
  }

  async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;

      const usuario = await authServicio.findById(id);
      if (!usuario) 
        return res.status(404).json({ ok: false, mensaje: "ERROR: Usuario no encontrado." });

      res.json({ ok: true, usuario });
    } catch (error) {
      console.error("ERROR", error);
      res.status(500).json({ ok: false, mensaje: "ERROR al obtener el usuario." });
    }
  }

  async modificarUsuario(req, res) {
    try {
      const { id } = req.params;
      if (req.user.tipo_usuario === 3 && req.user.usuario_id != id)
        return res.status(403).json({ ok: false, mensaje: "ERROR: No puedes modificar otro usuario" });

      const actualizado = await authServicio.modificarUsuario({ usuario_id: id, ...req.body });
      if (!actualizado) return res.status(404).json({ ok: false, mensaje: "ERROR: Usuario no encontrado o sin cambios." });

      res.json({ ok: true, mensaje: "Usuario modificado con éxito." });
    } catch (error) {
      console.error("ERROR", error);
      res.status(500).json({ ok: false, mensaje: "ERROR al modificar el usuario." });
    }
  }

  async eliminarUsuario(usuario_id) {
    return await authServicio.eliminarUsuario(usuario_id);
  }

  async listarUsuarios(req, res) {
    try {
      const usuarios = await authServicio.listarUsuarios();
      res.json({ ok: true, usuarios });
    } catch (error) {
      console.error("ERROR", error);
      res.status(500).json({ ok: false, mensaje: "ERROR al listar los usuarios." });
    }
  }
}