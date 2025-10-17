import { conexion } from "../db/conexion.js";
import bcrypt from "bcryptjs";

export default class AuthServicio {
  async findByNombreUsuario(nombre_usuario) {
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? LIMIT 1",
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

  async createUser({
    nombre,
    apellido,
    nombre_usuario,
    contrasenia,
    tipo_usuario = "cliente",
    celular = null,
    foto = null,
  }) {
    const hash = await bcrypt.hash(contrasenia, 10);
    const [result] = await conexion.execute(
      `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, creado, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [nombre, apellido, nombre_usuario, hash, tipo_usuario, celular, foto]
    );
    const user = await this.findById(result.insertId);
    return user;
  }

  async modificarUsuario({
    usuario_id,
    nombre,
    apellido,
    nombre_usuario,
    contrasenia,
    tipo_usuario,
    celular,
    foto,
    activo,
  }) {
    let query = `
      UPDATE usuarios 
      SET nombre = ?, apellido = ?, nombre_usuario = ?, tipo_usuario = ?, celular = ?, foto = ?, activo = ?, modificado = NOW()
    `;
    const params = [
      nombre,
      apellido,
      nombre_usuario,
      tipo_usuario,
      celular,
      foto,
      activo,
    ];

    if (contrasenia) {
      const hash = await bcrypt.hash(contrasenia, 10);
      query += `, contrasenia = ?`;
      params.push(hash);
    }

    query += ` WHERE usuario_id = ?`;
    params.push(usuario_id);

    const [result] = await conexion.execute(query, params);
    return result.affectedRows;
  }
}