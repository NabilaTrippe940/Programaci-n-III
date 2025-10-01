import { conexion } from './conexion.js';


export default class Salones {
  buscarSalones = async () => { //GET http://localhost:3000/api/v1/salones
    const sql = 'SELECT * FROM salones WHERE activo = 1';
    const [salones] = await conexion.execute(sql);
    return salones;
  }

  buscarSalonesPorId = async (salon_id) => { //GET http://localhost:3000/api/v1/salones/ + ID del Salón
    const sql = 'SELECT * FROM salones WHERE activo = 1 AND salon_id = ?';
    const [salon] = await conexion.execute(sql, [salon_id]);
    return salon;
  }

  crearSalones = async ({ titulo, direccion, latitud, longitud, capacidad, importe }) => { //POST http://localhost:3000/api/v1/salones
    const sql = `
      INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe, creado, activo)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
    `;
    const [result] = await conexion.execute(sql, [titulo, direccion, latitud, longitud, capacidad, importe]);
    return result.insertId;
  }

  modificarSalones = async ({ salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo }) => { //PUT http://localhost:3000/api/v1/salones/ + ID del Salón
    const sql = `
      UPDATE salones
      SET titulo=?, direccion=?, latitud=?, longitud=?, capacidad=?, importe=?, modificado=NOW(), activo=?
      WHERE salon_id=?
    `;
    const [result] = await conexion.execute(sql, [titulo, direccion, latitud, longitud, capacidad, importe, activo, salon_id]); //DEL http://localhost:3000/api/v1/salones/ + ID del Salón
    return result.affectedRows;
  }

  eliminarSalones = async (salon_id) => {
    const sql = 'UPDATE salones SET activo=0, modificado=NOW() WHERE salon_id=?';
    const [result] = await conexion.execute(sql, [salon_id]);
    return result.affectedRows;
  }
}