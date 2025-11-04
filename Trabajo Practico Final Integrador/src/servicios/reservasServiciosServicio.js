//Src/Servicios/ReservasServiciosServicio.js
import ReservasServiciosDB from '../db/reservasServicios.js';
export default class ReservasServiciosServicio {
  constructor() {
    this.db = new ReservasServiciosDB();
  }

  listarPorReserva = (reserva_id) => this.db.listarPorReserva(reserva_id);

  agregarAServicio = (datos) => this.db.agregarAServicio(datos);

  eliminarPorId = (reserva_servicio_id) => this.db.eliminarPorId(reserva_servicio_id);
}