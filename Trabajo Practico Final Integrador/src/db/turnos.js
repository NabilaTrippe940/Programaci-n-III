import { conexion } from './conexion.js';

export default class Turnos {
  // Obtener todos los turnos activos
  buscarTurnos = async () => {
    const sql = 'SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC';
    const [turnos] = await conexion.execute(sql);
    return turnos;
  };

  // Obtener un turno por ID
  buscarTurnoPorId = async (turno_id) => {
    const sql = 'SELECT * FROM turnos WHERE activo = 1 AND turno_id = ?';
    const [turno] = await conexion.execute(sql, [turno_id]);
    return turno;
  };

  // Crear un nuevo turno
  crearTurno = async ({ orden, hora_desde, hora_hasta }) => {
    const sql = `
      INSERT INTO turnos (orden, hora_desde, hora_hasta, creado, activo)
      VALUES (?, ?, ?, NOW(), 1)
    `;
    const [result] = await conexion.execute(sql, [orden, hora_desde, hora_hasta]);
    return result.insertId;
  };

  // Modificar un turno que ya existe
  modificarTurno = async ({ turno_id, orden, hora_desde, hora_hasta, activo }) => {
    const sql = `
      UPDATE turnos
      SET orden=?, hora_desde=?, hora_hasta=?, modificado=NOW(), activo=?
      WHERE turno_id=?
    `;
    const [result] = await conexion.execute(sql, [
      orden,
      hora_desde,
      hora_hasta,
      activo,
      turno_id,
    ]);
    return result.affectedRows;
  };

  // Eliminar un turno (con soft delete)
  eliminarTurno = async (turno_id) => {
    const sql = 'UPDATE turnos SET activo=0, modificado=NOW() WHERE turno_id=?';
    const [result] = await conexion.execute(sql, [turno_id]);
    return result.affectedRows;
  };
}
