import { conexion } from "../db/conexion.js";

const DashboardDB = {
  async obtenerUsuarios() {
    const [filas] = await conexion.query(
      `SELECT tipo_usuario, COUNT(*) AS cantidad 
       FROM usuarios 
       WHERE activo = 1 
       GROUP BY tipo_usuario`
    );
    return filas;
  },

  async obtenerServicios() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) AS cantidad 
       FROM servicios 
       WHERE activo = 1`
    );
    return filas[0]?.cantidad ?? 0;
  },

  async obtenerSalones() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) AS cantidad 
       FROM salones 
       WHERE activo = 1`
    );
    return filas[0]?.cantidad ?? 0;
  },

  async obtenerTurnosDelDia() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) AS total 
       FROM turnos 
       WHERE activo = 1`
    );
    return filas[0]?.total ?? 0;
  },

  async obtenerReservasHoy() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) AS total 
       FROM reservas 
       WHERE activo = 1 
         AND DATE(fecha_reserva) = CURDATE()`
    );
    return filas[0]?.total ?? 0;
  },

  async obtenerReservasMes() {
    const [filas] = await conexion.query(
      `SELECT COUNT(*) AS total 
       FROM reservas 
       WHERE activo = 1
         AND YEAR(fecha_reserva) = YEAR(CURDATE()) 
         AND MONTH(fecha_reserva) = MONTH(CURDATE())`
    );
    return filas[0]?.total ?? 0;
  },

  async obtenerKpisReservas() {
    const [filas] = await conexion.query(
      `SELECT 
         SUM(CASE WHEN DATE(fecha_reserva) = CURDATE() THEN 1 ELSE 0 END) AS hoy,
         SUM(CASE 
               WHEN YEAR(fecha_reserva) = YEAR(CURDATE()) 
                AND MONTH(fecha_reserva) = MONTH(CURDATE())
               THEN 1 ELSE 0 END) AS mes
       FROM reservas
       WHERE activo = 1`
    );
    const row = filas[0] || {};
    return { hoy: row.hoy ?? 0, mes: row.mes ?? 0 };
  },

  async obtenerReservasProximosDias() {
    const [filas] = await conexion.query(
      `SELECT 
          r.reserva_id, 
          r.fecha_reserva, 
          s.titulo AS salon, 
          u.nombre AS cliente
       FROM reservas r
       JOIN usuarios u ON u.usuario_id = r.usuario_id AND u.activo = 1
       JOIN salones  s ON s.salon_id  = r.salon_id  AND s.activo = 1
       WHERE r.activo = 1
         AND DATE(r.fecha_reserva) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 5 DAY)
       ORDER BY r.fecha_reserva ASC, r.reserva_id ASC`
    );
    return filas;
  },

  async obtenerReservasPorMes() {
    const [filas] = await conexion.query(`
      SELECT 
        DATE_FORMAT(fecha_reserva, '%b') AS mes, 
        YEAR(fecha_reserva) AS anio,
        MONTH(fecha_reserva) AS nro_mes,
        COUNT(*) AS total
      FROM reservas
      WHERE activo = 1
        AND fecha_reserva >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY anio, nro_mes, mes
      ORDER BY anio, nro_mes
    `);
    return filas;
  },

  async obtenerReservasPorSalonMesActual() {
    const [filas] = await conexion.query(`
      SELECT 
        s.titulo AS salon, 
        COUNT(r.reserva_id) AS total
      FROM salones s
      LEFT JOIN reservas r 
        ON r.salon_id = s.salon_id 
       AND r.activo = 1
       AND YEAR(r.fecha_reserva) = YEAR(CURDATE())
       AND MONTH(r.fecha_reserva) = MONTH(CURDATE())
      WHERE s.activo = 1
      GROUP BY s.titulo
      ORDER BY total DESC, s.titulo ASC
    `);
    return filas;
  },

  async obtenerTurnosReservadosHoy() {
    return this.obtenerReservasHoy();
  },
};

export default DashboardDB;



