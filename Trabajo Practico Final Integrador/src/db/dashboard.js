import { conexion } from "../db/conexion.js";


const DashboardDB = {
  async obtenerUsuarios() {
    const [filas] = await conexion.query(
      `SELECT tipo_usuario, COUNT(*) as cantidad FROM usuarios WHERE activo=1 GROUP BY tipo_usuario`
    );
    return filas;
  },

  async obtenerServicios() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as cantidad FROM servicios WHERE activo=1`
    );
    return filas[0].cantidad;
  },

  async obtenerSalones() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as cantidad FROM salones WHERE activo=1`
    );
    return filas[0].cantidad;
  },

  async obtenerTurnosDelDia() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as total FROM turnos WHERE activo=1`
    );
    return filas[0].total;
  },

  async obtenerTurnosReservadosHoy() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as total FROM reservas WHERE fecha_reserva = CURDATE() AND activo=1`
    );
    return filas[0].total;
  },

  async obtenerReservasHoy() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as total FROM reservas WHERE fecha_reserva = CURDATE() AND activo=1`
    );
    return filas[0].total;
  },

  async obtenerReservasMes() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) as total 
       FROM reservas 
       WHERE MONTH(fecha_reserva)=MONTH(CURDATE()) 
       AND YEAR(fecha_reserva)=YEAR(CURDATE()) 
       AND activo=1`
    );
    return filas[0].total;
  },

  async obtenerReservasProximosDias() {
    const [filas] = await conexion.query(
      `SELECT r.reserva_id, r.fecha_reserva, s.titulo AS salon, u.nombre AS cliente
       FROM reservas r
       JOIN salones s ON r.salon_id = s.salon_id
       JOIN usuarios u ON r.usuario_id = u.usuario_id
       WHERE r.fecha_reserva BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 5 DAY)
       ORDER BY r.fecha_reserva ASC`
    );
    return filas;
  },

  async obtenerReservasPorMes() {
    const [filas] = await conexion.query(`
      SELECT DATE_FORMAT(fecha_reserva, '%b') AS mes, COUNT(*) as total
      FROM reservas
      WHERE fecha_reserva >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY mes
      ORDER BY fecha_reserva
    `);
    return filas;
  },

  async obtenerReservasPorSalonMesActual() {
    const [filas] = await conexion.query(`
      SELECT s.titulo AS salon, COUNT(*) AS total
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      WHERE MONTH(r.fecha_reserva) = MONTH(CURDATE())
      AND YEAR(r.fecha_reserva) = YEAR(CURDATE())
      GROUP BY s.titulo
    `);
    return filas;
  },
};

export default DashboardDB;
