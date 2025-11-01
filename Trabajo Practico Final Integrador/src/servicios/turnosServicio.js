//Src/Servicios/TurnosServicio.js
import Turnos from '../db/turnos.js';

export default class TurnosServicio {
  constructor() {
    this.turnos = new Turnos();
  }

  buscarTurnos = () => this.turnos.buscarTurnos();
  buscarTurnoPorId = (id) => this.turnos.buscarTurnoPorId(id);
  crearTurno = (datos) => this.turnos.crearTurno(datos);
  modificarTurno = (datos) => this.turnos.modificarTurno(datos);
  eliminarTurno = (id) => this.turnos.eliminarTurno(id);
}