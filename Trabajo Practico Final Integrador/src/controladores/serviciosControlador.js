import ServiciosServicio from '../servicios/serviciosServicio.js';

export default class ServiciosControlador {
  constructor() {
    this.serviciosServicio = new ServiciosServicio();
  }

  buscarServicios = async (req, res) => {
    try {
      const servicios = await this.serviciosServicio.buscarServicios();
      res.json({ ok: true, servicios });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al obtener los servicios' });
    }
  }

  buscarServicioPorId = async (req, res) => {
    try {
      const servicio = await this.serviciosServicio.buscarServicioPorId(req.params.id);
      if (servicio.length === 0) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
      res.json({ ok: true, servicio });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al obtener el servicio' });
    }
  }

    crearServicio = async (req, res) => {
    try {
      const { descripcion, importe } = req.body;
      if (!descripcion || !importe) return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
      const id = await this.serviciosServicio.crearServicio({ descripcion, importe });
      res.status(201).json({ ok: true, mensaje: 'Servicio creado con éxito', servicio_id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al crear el servicio' });
    }
  }


    modificarServicio = async (req, res) => {
    try {
        const servicio_id = req.params.id; //se pone el ID en la URL
        const { descripcion, importe, activo } = req.body;
        if (!servicio_id) return res.status(400).json({ ok:false, mensaje: 'ID requerido' });

        const affected = await this.serviciosServicio.modificarServicio({ servicio_id, descripcion, importe, activo });
        if (affected === 0) return res.status(404).json({ ok:false, mensaje: 'Servicio no encontrado' });
        res.json({ ok: true, mensaje: 'Servicio modificado con éxito.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok:false, mensaje:'ERROR al modificar el servicio.' });
    }
    }

    eliminarServicio = async (req, res) => {
    try {
      const affected = await this.serviciosServicio.eliminarServicio(req.params.id);
      if (affected === 0) return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
      res.json({ ok: true, mensaje: 'Servicio eliminado con éxito' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'ERROR al eliminar el servicio' });
    }
  }

}