//Src/Servicios/AuthServicio.js
import { conexion } from "../db/conexion.js";
import bcrypt from "bcryptjs";

export default class AuthServicio {
  async findByNombreUsuario(nombre_usuario) {
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1 LIMIT 1",
      [nombre_usuario]
    );
    return rows[0];
  }

  async findById(usuario_id) {
    const [rows] = await conexion.execute(
      `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado, activo 
       FROM usuarios WHERE usuario_id = ? LIMIT 1`,
      [usuario_id]
    );
    return rows[0];
  }

  async createUser({ nombre, apellido, nombre_usuario, contrasenia, tipo_usuario = 3, celular = null, foto = null }) {
    const hash = await bcrypt.hash(contrasenia, 10);
    const [result] = await conexion.execute(
      `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, creado, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [nombre, apellido, nombre_usuario, hash, tipo_usuario, celular, foto]
    );
    return await this.findById(result.insertId);
  }

  async modificarUsuario(datos) {
    const { usuario_id, ...resto } = datos;
    const campos = [];
    const valores = [];

    for (const [key, value] of Object.entries(resto)) {
      if (value !== undefined) {
        if (key === "contrasenia") {
          const hash = await bcrypt.hash(value, 10);
          campos.push(`${key} = ?`);
          valores.push(hash);
        } else {
          campos.push(`${key} = ?`);
          valores.push(value);
        }
      }
    }

    if (!campos.length) return 0;

    valores.push(usuario_id);
    const [result] = await conexion.execute(
      `UPDATE usuarios SET ${campos.join(", ")}, modificado = NOW() WHERE usuario_id = ?`,
      valores
    );
    return result.affectedRows;
  }

  async eliminarUsuario(usuario_id) {
    const [result] = await conexion.execute(
      "UPDATE usuarios SET activo = 0, modificado = NOW() WHERE usuario_id = ?",
      [usuario_id]
    );
    return result.affectedRows;
  }

  async listarUsuarios() {
    const [rows] = await conexion.execute(
      `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, creado, modificado, activo 
       FROM usuarios`
    );
    return rows;
  }
}