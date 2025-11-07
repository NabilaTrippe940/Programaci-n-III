//Src/Servicios/ReservasServicio.js
import { conexion } from '../db/conexion.js';

export default class ReservasServicio {
  constructor() {}

  buscarReservas = async () => {
    try {
      const [reservas] = await conexion.query('SELECT * FROM reservas WHERE activo = 1');
      return reservas;
    } catch (err) {
      console.error('ERROR en buscarReservas (Servicio):', err);
      throw err;
    }
  };

  buscarReservasPorId = async (reserva_id) => {
    try {
      const [reserva] = await conexion.query('SELECT * FROM reservas WHERE reserva_id = ?', [reserva_id]);
      return reserva;
    } catch (err) {
      console.error('ERROR en buscarReservasPorId (Servicio):', err);
      throw err;
    }
  };

  buscarReservasPorUsuario = async (usuario_id) => {
    try {
      const [reservas] = await conexion.query(
        'SELECT * FROM reservas WHERE usuario_id = ? AND activo = 1',
        [usuario_id]
      );
      return reservas;
    } catch (err) {
      console.error('ERROR en buscarReservasPorUsuario (Servicio):', err);
      throw err;
    }
  };

  crearReservas = async ({ fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_total, servicios }) => {
    try {
      const sql = `
        INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_total, activo, creado)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
      `;
      const [resultado] = await conexion.query(sql, [
        fecha_reserva,
        salon_id,
        usuario_id,
        turno_id,
        tematica,
        importe_total
      ]);

      const reserva_id = resultado.insertId;

      if (Array.isArray(servicios) && servicios.length > 0) {
        await this.asociarServiciosAReserva(reserva_id, servicios);
      }

      return reserva_id;
    } catch (err) {
      console.error('ERROR en crearReservas (Servicio):', err);
      throw err;
    }
  };

  modificarReservas = async ({ reserva_id, fecha_reserva, turno_id, tematica, importe_total }) => {
    try {
      const [reserva] = await conexion.query(
        'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1',
        [reserva_id]
      );

      if (!reserva?.length) return 0;

      const campos = [];
      const valores = [];

      if (fecha_reserva) {
        campos.push('fecha_reserva = ?');
        valores.push(fecha_reserva);
      }
      if (turno_id) {
        campos.push('turno_id = ?');
        valores.push(turno_id);
      }
      if (tematica) {
        campos.push('tematica = ?');
        valores.push(tematica);
      }
      if (importe_total) {
        campos.push('importe_total = ?');
        valores.push(importe_total);
      }

      if (!campos.length) return 0;

      valores.push(reserva_id);
      const query = `UPDATE reservas SET ${campos.join(', ')} WHERE reserva_id = ?`;
      const [resultado] = await conexion.query(query, valores);

      return resultado.affectedRows;
    } catch (error) {
      console.error('Error en modificarReservas:', error);
      throw error;
    }
  };

  eliminarReservas = async (reserva_id) => {
    try {
      const [resultado] = await conexion.query(
        'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
        [reserva_id]
      );
      return resultado.affectedRows;
    } catch (err) {
      console.error('ERROR en eliminarReservas (Servicio):', err);
      throw err;
    }
  };

  verificarDisponibilidad = async ({ fecha_reserva, salon_id, turno_id }) => {
    try {
      const [resultado] = await conexion.query(
        'SELECT COUNT(*) AS cantidad FROM reservas WHERE fecha_reserva = ? AND salon_id = ? AND turno_id = ? AND activo = 1',
        [fecha_reserva, salon_id, turno_id]
      );
      return resultado[0].cantidad === 0;
    } catch (err) {
      console.error('ERROR en verificarDisponibilidad (Servicio):', err);
      throw err;
    }
  };

  asociarServiciosAReserva = async (reserva_id, servicios) => {
    try {
      const sql = `
        INSERT INTO reservas_servicios (reserva_id, servicio_id, creado, importe)
        VALUES (?, ?, NOW(), (
          SELECT importe FROM servicios WHERE servicio_id = ?
        ))
      `;
      for (const servicio_id of servicios) {
        await conexion.query(sql, [reserva_id, servicio_id, servicio_id]);
      }
    } catch (err) {
      console.error('ERROR al asociar servicios a la reserva (Servicio):', err);
      throw err;
    }
  };
}
