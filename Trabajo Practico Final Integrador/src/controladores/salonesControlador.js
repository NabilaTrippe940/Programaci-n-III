import SalonesServicio from '../servicios/salonesServicio.js';


export default class SalonesControlador {
  constructor() {
    this.salonesServicio = new SalonesServicio();
  }

  buscarSalones = async (req, res) => {
    try {
      const salones = await this.salonesServicio.buscarSalones();
      res.json({ ok: true, salones });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al Obtener los Datos.' });
    }
  }

  buscarSalonesPorId = async (req, res) => {
    try {
      const salon = await this.salonesServicio.buscarSalonesPorId(req.params.salon_id);
      if (salon.length === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El Salón No Pudo Ser Encontrado.' });
      res.json({ ok: true, salon });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al Obtener los Datos.' });
    }
  }

  crearSalones = async (req, res) => {
    try {
      const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
      if (!titulo || !direccion || !capacidad || !importe) {
        return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan Datos Obligatorios.' });
      }
      const id = await this.salonesServicio.crearSalones({ titulo, direccion, latitud, longitud, capacidad, importe });
      res.status(201).json({ ok: true, mensaje: 'Salón Creado Con Exito.', salon_id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al Crear el Salón.' });
    }
  }

  modificarSalones = async (req, res) => {
    try {
      const { titulo, direccion, latitud, longitud, capacidad, importe, activo } = req.body;
      const salon_id = req.params.salon_id;
      if (!titulo || !direccion || !capacidad || !importe || typeof activo === 'undefined') {
        return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan Datos Obligatorios.' });
      }
      const affected = await this.salonesServicio.modificarSalones({ salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo });
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El Salón No Pudo Ser Encontrado.' });
      res.json({ ok: true, mensaje: 'Salón Modificado Con Exito.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al Modificar el Salón.' });
    }
  }

  eliminarSalones = async (req, res) => {
    try {
      const salon_id = req.params.salon_id;
      const affected = await this.salonesServicio.eliminarSalones(salon_id);
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El Salón No Pudo Ser Encontrado.' });
      res.json({ ok: true, mensaje: 'Salón Eliminado Con Exito.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al Eliminar el Salón.' });
    }
  }
}