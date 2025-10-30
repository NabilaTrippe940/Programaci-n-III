import ReservasServicios from '../db/reservasServicios.js';

export default class ReservasServiciosServicio {
  constructor() {
    this.reservasServicios = new ReservasServicios();
  }

  listarPorReserva = (reserva_id) => this.reservasServicios.listarPorReserva(reserva_id);

  agregarAServicio = (datos) => this.reservasServicios.agregarAServicio(datos);

  eliminar = (reserva_servicio_id) => this.reservasServicios.eliminar(reserva_servicio_id);
}
