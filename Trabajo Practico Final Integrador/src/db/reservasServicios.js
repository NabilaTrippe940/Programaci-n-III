//Src/Db/ReservasServicios.js
import { conexion } from './conexion.js';

export default class ReservasServiciosDB {
  
  listarPorReserva = async (reserva_id) => {
    const sql = `
      SELECT rs.reserva_servicio_id, rs.reserva_id, rs.servicio_id, rs.importe, rs.creado, rs.modificado,
             s.descripcion
      FROM reservas_servicios rs
      JOIN servicios s ON s.servicio_id = rs.servicio_id
      WHERE rs.reserva_servicio_id = ?
    `;
    const [rows] = await conexion.execute(sql, [reserva_id]);
    return rows;
  }

  agregarAServicio = async ({ reserva_id, servicio_id, importe }) => {
    const sql = `
      INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado)
      VALUES (?, ?, ?, NOW())
    `;
    const [result] = await conexion.execute(sql, [reserva_id, servicio_id, importe]);
    return result.insertId;
  }

  eliminarPorId = async (reserva_servicio_id) => {
    const sql = `
      DELETE FROM reservas_servicios
      WHERE reserva_servicio_id = ?
    `;
    const [result] = await conexion.execute(sql, [reserva_servicio_id]);
    return result.affectedRows;
  }
}