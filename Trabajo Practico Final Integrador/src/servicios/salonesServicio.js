//Src/Serivicios/SalonesServicio.js
import Salones from '../db/salones.js';
export default class SalonesServicio {
  constructor() {
    this.salones = new Salones();
  }
  buscarSalones = () => this.salones.buscarSalones();
  buscarSalonesPorId = (id) => this.salones.buscarSalonesPorId(id);
  crearSalones = (datos) => this.salones.crearSalones(datos);
  modificarSalones = (datos) => this.salones.modificarSalones(datos);
  eliminarSalones = (id) => this.salones.eliminarSalones(id);
}