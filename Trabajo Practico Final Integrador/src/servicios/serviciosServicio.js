//Src/Servicios/ServiciosServicio.js
import Servicios from '../db/servicios.js';

export default class ServiciosServicio {
  constructor() {
    this.servicios = new Servicios();
  }

  buscarServicios = () => this.servicios.buscarServicios();
  buscarServicioPorId = (id) => this.servicios.buscarServicioPorId(id);
  crearServicio = (datos) => this.servicios.crearServicio(datos);
  modificarServicio = (datos) => this.servicios.modificarServicio(datos);
  eliminarServicio = (id) => this.servicios.eliminarServicio(id);
}