import DashboardDB from "../db/dashboard.js";

const DashboardServicio = {
  async obtenerResumen() {
    const usuarios = await DashboardDB.obtenerUsuarios();
    const servicios = await DashboardDB.obtenerServicios();
    const salones = await DashboardDB.obtenerSalones();
    const turnosTotales = await DashboardDB.obtenerTurnosDelDia();
    const turnosReservados = await DashboardDB.obtenerTurnosReservadosHoy();
    const reservasHoy = await DashboardDB.obtenerReservasHoy();
    const reservasMes = await DashboardDB.obtenerReservasMes();
    const reservasProximas = await DashboardDB.obtenerReservasProximosDias();

    const disponibles = turnosTotales - turnosReservados;
    const ocupacion = turnosTotales
      ? ((turnosReservados / turnosTotales) * 100).toFixed(1)
      : 0;

    const resumen = {
      usuarios: {
        total: usuarios.reduce((a, b) => a + b.cantidad, 0),
        clientes:
          usuarios.find((u) => u.tipo_usuario === 1)?.cantidad || 0,
        empleados:
          usuarios.find((u) => u.tipo_usuario === 2)?.cantidad || 0,
        administradores:
          usuarios.find((u) => u.tipo_usuario === 3)?.cantidad || 0,
      },
      catalogo: {
        servicios,
        salones,
      },
      turnosHoy: {
        totales: turnosTotales,
        reservados: turnosReservados,
        disponibles,
        ocupacion,
      },
      reservas: {
        hoy: reservasHoy,
        mes: reservasMes,
        proximas: reservasProximas,
      },
    };

    return resumen;
  },

  async obtenerDatosGraficos() {
    const porMes = await DashboardDB.obtenerReservasPorMes();
    const porSalon = await DashboardDB.obtenerReservasPorSalonMesActual();

    return {
      reservasPorMes: porMes,
      reservasPorSalon: porSalon,
    };
  },
};

export default DashboardServicio;