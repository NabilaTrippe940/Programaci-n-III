// src/controladores/authControlador.js
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import AuthServicio from "../servicios/authServicio.js";
import dotenv from "dotenv";
dotenv.config();

const REFRESH_TOKENS = new Set();

export default class AuthControlador {
  constructor() {
    this.authServicio = new AuthServicio();
  }

  register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errores: errors.array() });

    try {
      const existing = await this.authServicio.findByNombreUsuario(
        req.body.nombre_usuario
      );
      if (existing)
        return res
          .status(409)
          .json({ ok: false, mensaje: "Usuario ya registrado" });

      const user = await this.authServicio.createUser(req.body);
      res
        .status(201)
        .json({ ok: true, mensaje: "Usuario registrado correctamente", user });
    } catch (error) {
      console.error("Error MySQL:", error);
      res.status(500).json({
        ok: false,
        mensaje: "Error al registrar usuario",
        error: error.message,
      });
    }
  };

  login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errores: errors.array() });

    const { nombre_usuario, contrasenia } = req.body;

    try {
      const user = await this.authServicio.findByNombreUsuario(nombre_usuario);
      if (!user)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });

      const validPassword = await bcrypt.compare(contrasenia, user.contrasenia);
      if (!validPassword)
        return res
          .status(401)
          .json({ ok: false, mensaje: "Contraseña incorrecta" });

      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        console.error("Falta JWT_SECRET o JWT_REFRESH_SECRET en .env");
        return res
          .status(500)
          .json({ ok: false, mensaje: "Configuración de servidor incompleta" });
      }

      const accessToken = jwt.sign(
        {
          usuario_id: user.usuario_id,
          nombre_usuario: user.nombre_usuario,
          tipo_usuario: user.tipo_usuario,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2m" } // usa variable de entorno si existe
      );

      const refreshToken = jwt.sign(
        {
          usuario_id: user.usuario_id,
          nombre_usuario: user.nombre_usuario,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      REFRESH_TOKENS.add(refreshToken);

      res.json({
        ok: true,
        mensaje: "Inicio de sesión exitoso",
        accessToken,
        refreshToken,
        user: {
          usuario_id: user.usuario_id,
          nombre: user.nombre,
          apellido: user.apellido,
          nombre_usuario: user.nombre_usuario,
          tipo_usuario: user.tipo_usuario,
          celular: user.celular,
          foto: user.foto,
          creado: user.creado,
          modificado: user.modificado,
          activo: user.activo,
        },
      });
    } catch (error) {
      console.error("Error login:", error);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error en el servidor", error: error.message });
    }
  };

  refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ mensaje: "Refresh token requerido" });
    if (!REFRESH_TOKENS.has(token))
      return res.status(403).json({ mensaje: "Refresh token inválido" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = jwt.sign(
        {
          usuario_id: decoded.usuario_id,
          nombre_usuario: decoded.nombre_usuario,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "30s" }
      );
      res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error("refreshToken error:", err);
      return res.status(403).json({ mensaje: "Refresh token expirado o inválido" });
    }
  };

  logout = async (req, res) => {
    const { token } = req.body;
    REFRESH_TOKENS.delete(token);
    res.json({ mensaje: "Sesión cerrada correctamente" });
  };

  obtenerUsuario = async (req, res) => {
    try {
      const usuario_id = req.params.usuario_id;
      const user = await this.authServicio.findById(usuario_id);
      if (!user)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado" });
      res.json({ ok: true, user });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al obtener el usuario." });
    }
  };

  modificarUsuario = async (req, res) => {
    try {
      const usuario_id = req.params.usuario_id;
      const datos = req.body;

      if (req.user.usuario_id != usuario_id && req.user.tipo_usuario !== "admin") {
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes permiso para modificar este usuario.",
        });
      }

      const affected = await this.authServicio.modificarUsuario({ usuario_id, ...datos });
      if (affected === 0)
        return res
          .status(404)
          .json({ ok: false, mensaje: "Usuario no encontrado." });

      res.json({ ok: true, mensaje: "Usuario modificado con éxito." });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ ok: false, mensaje: "Error al modificar el usuario." });
    }
  };
}