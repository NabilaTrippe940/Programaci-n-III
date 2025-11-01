//Src/Controlador/TurnosControlador.js
import TurnosServicio from '../servicios/turnosServicio.js';

export default class TurnosControlador {
  constructor() {
    this.turnosServicio = new TurnosServicio();
  }

  buscarTurnos = async (req, res) => {
    try {
      const turnos = await this.turnosServicio.buscarTurnos();
      res.json({ ok: true, turnos });
    } catch (err) {
      console.error('Error al obtener turnos:', err);
      res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los turnos.' });
    }
  };

  buscarTurnoPorId = async (req, res) => {
    try {
      const turno = await this.turnosServicio.buscarTurnoPorId(req.params.id);
      if (turno.length === 0)
        return res.status(404).json({ ok: false, mensaje: 'Turno no encontrado.' });
      res.json({ ok: true, turno });
    } catch (err) {
      console.error('Error al obtener turno:', err);
      res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el turno.' });
    }
  };

  crearTurno = async (req, res) => {
    try {
      const { orden, hora_desde, hora_hasta } = req.body;
      if (!orden || !hora_desde || !hora_hasta) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios.' });
      }

      const id = await this.turnosServicio.crearTurno({ orden, hora_desde, hora_hasta });

      res.status(201).json({ ok: true, mensaje: 'Turno creado con éxito.', turno_id: id });
    } catch (err) {
      console.error('Error al crear turno:', err);
      res.status(500).json({ ok: false, mensaje: 'Error interno al crear el turno.' });
    }
  };

  modificarTurno = async (req, res) => {
    try {
      const turno_id = req.params.id;
      const { orden, hora_desde, hora_hasta, activo } = req.body;

      if (!turno_id)
        return res.status(400).json({ ok: false, mensaje: 'El ID del turno es obligatorio.' });

      const affected = await this.turnosServicio.modificarTurno({
        turno_id,
        orden,
        hora_desde,
        hora_hasta,
        activo,
      });

      if (affected === 0)
        return res.status(404).json({ ok: false, mensaje: 'Turno no encontrado.' });

      res.json({ ok: true, mensaje: 'Turno modificado con éxito.' });
    } catch (err) {
      console.error('Error al modificar turno:', err);
      res.status(500).json({ ok: false, mensaje: 'Error interno al modificar el turno.' });
    }
  };

  eliminarTurno = async (req, res) => {
    try {
      const affected = await this.turnosServicio.eliminarTurno(req.params.id);
      if (affected === 0)
        return res.status(404).json({ ok: false, mensaje: 'Turno no encontrado.' });
      res.json({ ok: true, mensaje: 'Turno eliminado con éxito.' });
    } catch (err) {
      console.error('Error al eliminar turno:', err);
      res.status(500).json({ ok: false, mensaje: 'Error interno al eliminar el turno.' });
    }
  };
}