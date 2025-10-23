//Src/Controladores/SalonesControlador.js
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
      res.status(500).json({ ok: false, mensaje: 'ERROR al obtener los datos' });
    }
  }

  buscarSalonesPorId = async (req, res) => {
    try {
      const salon = await this.salonesServicio.buscarSalonesPorId(req.params.id);
      if (salon.length === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El salón no pudo ser encontrado.' });
      res.json({ ok: true, salon });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al obtener los datos.' });
    }
  }

  crearSalones = async (req, res) => {
    try {
      const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
      if (!titulo || !direccion || !capacidad || !importe) {
        return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan datos obligatorios.' });
      }
      const id = await this.salonesServicio.crearSalones({ titulo, direccion, latitud, longitud, capacidad, importe });
      res.status(201).json({ ok: true, mensaje: 'Salón creado con éxito.', salon_id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al crear el salón.' });
    }
  }

  modificarSalones = async (req, res) => {
    try {
      const { salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo } = req.body;
      if (!salon_id || !titulo || !direccion || !capacidad || !importe || typeof activo === 'undefined') {
        return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan datos obligatorios.' });
      }
      const affected = await this.salonesServicio.modificarSalones({ salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo });
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El salón no pudo ser encontrado.' });
      res.json({ ok: true, mensaje: 'Salón modificado con éxito.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al modificar el salón.' });
    }
  }


  eliminarSalones = async (req, res) => {
    try {
      const salon_id = req.params.salon_id;
      const affected = await this.salonesServicio.eliminarSalones(salon_id);
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El salón no pudo ser encontrado.' });
      res.json({ ok: true, mensaje: 'Salón eliminado con éxito.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al eliminar el salón.' });
    }
  }
}