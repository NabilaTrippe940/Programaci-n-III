//Src/Servicios/UsuariosServicios.js
import UsuariosDB from '../db/usuarios.js';

export default class UsuariosServicio {
  constructor() {
    this.usuariosDB = new UsuariosDB();
  }

  obtenerUsuarioActivoPorId = async (usuario_id) => {
    const user = await this.usuariosDB.obtenerPorId(usuario_id);
    if (!user || user.activo !== 1) return null;
    return user;
  }
}