import DashboardServicio from "../servicios/dashboardServicio.js";

class DashboardControlador {
  async obtenerResumen(req, res) {
    try {
      const data = await DashboardServicio.obtenerResumen();
      res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "Error al obtener resumen" });
    }
  }

  async obtenerGraficos(req, res) {
    try {
      const data = await DashboardServicio.obtenerDatosGraficos();
      res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "Error al obtener gráficos" });
    }
  }
}

export default new DashboardControlador();
