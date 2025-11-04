//Src/Db/Servicios.js
import { conexion } from './conexion.js';

export default class Servicios {
  
    buscarServicios = async () => { // GET all
    const sql = 'SELECT * FROM servicios WHERE activo = 1';
    const [servicios] = await conexion.execute(sql);
    return servicios;
  }

  buscarServicioPorId = async (servicio_id) => { // GET by ID
    const sql = 'SELECT * FROM servicios WHERE activo = 1 AND servicio_id = ?';
    const [servicio] = await conexion.execute(sql, [servicio_id]);
    return servicio;
  }

  crearServicio = async ({ descripcion, importe }) => { // POST
    const sql = `
      INSERT INTO servicios (descripcion, importe, creado, activo)
      VALUES (?, ?, NOW(), 1)
    `;
    const [result] = await conexion.execute(sql, [descripcion, importe]);
    return result.insertId;
  }

  modificarServicio = async ({ servicio_id, descripcion, importe, activo }) => { // PUT
    const sql = `
      UPDATE servicios
      SET descripcion=?, importe=?, modificado=NOW(), activo=?
      WHERE servicio_id=?
    `;
    const [result] = await conexion.execute(sql, [descripcion, importe, activo, servicio_id]);
    return result.affectedRows;
  }

  eliminarServicio = async (servicio_id) => { // DELETE (soft delete)
    const sql = 'UPDATE servicios SET activo=0, modificado=NOW() WHERE servicio_id=?';
    const [result] = await conexion.execute(sql, [servicio_id]);
    return result.affectedRows;
  }

}