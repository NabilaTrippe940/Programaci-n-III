//Src/Db/ReservasServicios.js
import { conexion } from './conexion.js';

export default class ReservasServicios {

  listarPorReserva = async (reserva_id) => {
    const sql = `
      SELECT rs.reserva_servicio_id, rs.reserva_id, rs.servicio_id, rs.cantidad, rs.importe, rs.creado,
             s.descripcion
      FROM reservas_servicios rs
      JOIN servicios s ON s.servicio_id = rs.servicio_id
      WHERE rs.activo = 1 AND rs.reserva_id = ?
    `;
    const [rows] = await conexion.execute(sql, [reserva_id]);
    return rows;
  }

  agregarAServicio = async ({ reserva_id, servicio_id, cantidad = 1, importe }) => {
    const sql = `
      INSERT INTO reservas_servicios (reserva_id, servicio_id, cantidad, importe, creado, activo)
      VALUES (?, ?, ?, ?, NOW(), 1)
    `;
    const [result] = await conexion.execute(sql, [reserva_id, servicio_id, cantidad, importe]);
    return result.insertId;
  }

  eliminar = async (reserva_servicio_id) => {
    const sql = `
      UPDATE reservas_servicios
      SET activo = 0, modificado = NOW()
      WHERE reserva_servicio_id = ? AND activo = 1
    `;
    const [result] = await conexion.execute(sql, [reserva_servicio_id]);
    return result.affectedRows;
  }
}