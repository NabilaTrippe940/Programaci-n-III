//Src/Middlewares/AuthenticateJWT.js

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { conexion } from "../db/conexion.js";

dotenv.config();

export const authenticateJWT = async (req, res, next) => {
  try {
    // 🔐 Extraer token del header
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return res.status(401).json({ ok: false, msg: "Token requerido" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) return res.status(401).json({ ok: false, msg: "Token requerido" });

    // 🔍 Verificar token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          ok: false,
          mensaje: "Token expirado",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({ ok: false, mensaje: "Token inválido" });
    }

    // 🧠 Buscar usuario en base de datos
    const [rows] = await conexion.execute(
      "SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, activo FROM usuarios WHERE usuario_id = ? LIMIT 1",
      [payload.usuario_id]
    );

    const user = rows && rows[0];

    if (!user || user.activo !== 1) {
      return res.status(401).json({ ok: false, msg: "Usuario no válido o inactivo" });
    }

    // ✅ Asignar datos al request para uso en middlewares
    req.user = {
      usuario_id: user.usuario_id,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_usuario: user.nombre_usuario,
      tipo_usuario: user.tipo_usuario, // ← este campo es clave para validar roles
    };

    next();
  } catch (err) {
    console.error("authenticateJWT error:", err);
    res.status(500).json({ ok: false, msg: "Error interno en autenticación" });
  }
};

/**
 * 🔁 Genera Access Token (corto) y Refresh Token (largo)
 * @param {Object} user - { usuario_id, nombre_usuario, tipo_usuario }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokens = (user) => {
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET no definido en las variables de entorno");

  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET no definido en las variables de entorno");

  const accessToken = jwt.sign(
    {
      usuario_id: user.usuario_id,
      nombre_usuario: user.nombre_usuario,
      tipo_usuario: user.tipo_usuario,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "5m" }
  );

  const refreshToken = jwt.sign(
    {
      usuario_id: user.usuario_id,
      nombre_usuario: user.nombre_usuario,
      tipo_usuario: user.tipo_usuario,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};