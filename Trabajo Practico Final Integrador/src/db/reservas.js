//Src/Db/Reservas.js
import { conexion } from './conexion.js';

export default class Reservas {
  // GET http://localhost:3000/api/v1/reservas
  buscarReservas = async () => {
    const sql = `
      SELECT r.*, 
             u.nombre AS cliente, 
             s.titulo AS salon, 
             t.hora_desde, 
             t.hora_hasta
      FROM reservas r
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1
      ORDER BY r.fecha_reserva DESC
    `;
    const [reservas] = await conexion.execute(sql);
    return reservas;
  };

  // GET http://localhost:3000/api/v1/reservas/:id
  buscarReservasPorId = async (reserva_id) => {
    const sql = `
      SELECT r.*, 
             u.nombre AS cliente, 
             s.titulo AS salon, 
             t.hora_desde, 
             t.hora_hasta
      FROM reservas r
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1 AND r.reserva_id = ?
    `;
    const [reserva] = await conexion.execute(sql, [reserva_id]);
    return reserva;
  };

  // GET http://localhost:3000/api/v1/reservas/usuario/:usuario_id
  buscarReservasPorUsuario = async (usuario_id) => {
    const sql = `
      SELECT r.*, 
             s.titulo AS salon, 
             t.hora_desde, 
             t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1 AND r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC
    `;
    const [reservas] = await conexion.execute(sql, [usuario_id]);
    return reservas;
  };

  // POST http://localhost:3000/api/v1/reservas
  crearReservas = async ({ fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_total }) => {
    const sql = `
      INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_total, creado, activo)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
    `;
    const [result] = await conexion.execute(sql, [
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      tematica,
      importe_total,
    ]);
    return result.insertId;
  };

  // PUT http://localhost:3000/api/v1/reservas
  modificarReservas = async ({ reserva_id, fecha_reserva, turno_id, tematica, importe_total, activo }) => {
    const sql = `
      UPDATE reservas
      SET fecha_reserva = ?, turno_id = ?, tematica = ?, importe_total = ?, 
          modificado = NOW(), activo = ?
      WHERE reserva_id = ?
    `;
    const [result] = await conexion.execute(sql, [
      fecha_reserva,
      turno_id,
      tematica,
      importe_total,
      activo,
      reserva_id,
    ]);
    return result.affectedRows;
  };

  // DELETE (soft delete) http://localhost:3000/api/v1/reservas/:id
  eliminarReservas = async (reserva_id) => {
    const sql = 'UPDATE reservas SET activo = 0, modificado = NOW() WHERE reserva_id = ?';
    const [result] = await conexion.execute(sql, [reserva_id]);
    return result.affectedRows;
  };

  // Verificar disponibilidad antes de crear reserva
  verificarDisponibilidad = async ({ fecha_reserva, salon_id, turno_id }) => {
    const sql = `
      SELECT COUNT(*) AS ocupadas 
      FROM reservas
      WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1
    `;
    const [rows] = await conexion.execute(sql, [fecha_reserva, salon_id, turno_id]);
    return rows[0].ocupadas === 0;
  };
}
