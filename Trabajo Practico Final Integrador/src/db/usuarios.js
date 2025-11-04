//Src/Db/Usuarios.js
import { conexion } from './conexion.js';

export default class UsuariosDB {

  obtenerPorId = async (usuario_id) => {
    const [rows] = await conexion.execute(
      `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, activo
       FROM usuarios WHERE usuario_id = ? LIMIT 1`,
      [usuario_id]
    );
    return rows[0] || null;
  }
}