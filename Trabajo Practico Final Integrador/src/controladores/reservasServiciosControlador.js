//Src/Controladores/ReservasServiciosControlador.js
import ReservasServiciosServicio from '../servicios/reservasServiciosServicio.js';

export default class ReservasServiciosControlador {
  constructor() {
    this.servicio = new ReservasServiciosServicio();
  }

  listarServiciosPorReserva = async (req, res) => {
    try {
      const reserva_id = req.params.reserva_id;
      const servicios = await this.servicio.listarPorReserva(reserva_id);
      res.json({ ok: true, servicios });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al listar servicios de la reserva' });
    }
  }

  agregarServicioAReserva = async (req, res) => {
    try {
      const { reserva_id, servicio_id, cantidad, importe } = req.body;
      if (!reserva_id || !servicio_id || importe === undefined) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios (reserva_id, servicio_id, importe)' });
      }
      const id = await this.servicio.agregarAServicio({ reserva_id, servicio_id, cantidad, importe });
      res.status(201).json({ ok: true, mensaje: 'Servicio agregado a la reserva', reserva_servicio_id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al agregar servicio a la reserva' });
    }
  }

  eliminarServicioDeReserva = async (req, res) => {
    try {
      const reserva_servicio_id = req.params.id;
      const affected = await this.servicio.eliminar(reserva_servicio_id);
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'Servicio de reserva no encontrado' });
      res.json({ ok: true, mensaje: 'Servicio de la reserva eliminado con éxito' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al eliminar servicio de la reserva' });
    }
  }
}