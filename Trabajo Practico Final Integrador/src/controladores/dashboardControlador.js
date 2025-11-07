//Src/Controladores/DashboardControlador.js
import DashboardDB from "../db/dashboard.js";

const dashboardControlador = {
  async obtenerResumen(req, res) {
    try {
    
      const usuariosTipos = await DashboardDB.obtenerUsuarios();
      const totalUsuarios = usuariosTipos.reduce((a, u) => a + (u.cantidad || 0), 0);

      const servicios = await DashboardDB.obtenerServicios();
      const salones = await DashboardDB.obtenerSalones();

      const turnosTotales = await DashboardDB.obtenerTurnosDelDia();
      const turnosReservados = await DashboardDB.obtenerTurnosReservadosHoy();
      const turnosDisponibles = Math.max(0, turnosTotales - turnosReservados);
      const ocupacion =
        turnosTotales > 0
          ? ((turnosReservados / turnosTotales) * 100).toFixed(1)
          : 0;

    
      const reservasHoy = await DashboardDB.obtenerReservasHoy();
      const reservasMes = await DashboardDB.obtenerReservasMes();
      const proximas = await DashboardDB.obtenerReservasProximosDias();

      const resumen = {
        usuarios: {
          total: totalUsuarios,
          clientes: usuariosTipos.find(u => u.tipo_usuario === 3)?.cantidad || 0,
          empleados: usuariosTipos.find(u => u.tipo_usuario === 2)?.cantidad || 0,
          administradores: usuariosTipos.find(u => u.tipo_usuario === 1)?.cantidad || 0
        },
        catalogo: { servicios, salones },
        turnosHoy: {
          totales: turnosTotales,
          reservados: turnosReservados,
          disponibles: turnosDisponibles,
          ocupacion
        },
        reservas: {
          hoy: reservasHoy,
          mes: reservasMes,
          proximas
        }
      };

      res.json({ ok: true, data: resumen });
    } catch (error) {
      console.error("Error en obtenerResumen:", error);
      res.status(500).json({ ok: false, mensaje: "Error al obtener resumen del dashboard" });
    }
  },

  async obtenerGraficos(req, res) {
    try {
      const reservasPorSalon = await DashboardDB.obtenerReservasPorSalonMesActual();
      const reservasPorMes = await DashboardDB.obtenerReservasPorMes();

      const graficos = {
        reservasPorSalon,
        reservasPorMes
      };

      res.json({ ok: true, data: graficos });
    } catch (error) {
      console.error("Error en obtenerGraficos:", error);
      res.status(500).json({ ok: false, mensaje: "Error al obtener datos de gráficos" });
    }
  }
};

export default dashboardControlador;