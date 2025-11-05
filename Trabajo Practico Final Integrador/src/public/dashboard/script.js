// =======================================================
//  TOKEN DEL DASHBOARD (aislado y saneado)
// =======================================================

const STORE = window.sessionStorage;              // Cambiá a localStorage si querés persistir entre pestañas
const TOKEN_KEY = 'dash.token';                   // Clave exclusiva del dashboard

function readToken()   { return (STORE.getItem(TOKEN_KEY) || '').trim(); }
function writeToken(t) { STORE.setItem(TOKEN_KEY, t); }
function clearToken()  { STORE.removeItem(TOKEN_KEY); }

let TOKEN = readToken();
if (!TOKEN) {
  TOKEN = prompt('Ingresar accessToken:') || '';
}
TOKEN = TOKEN.replace(/^Bearer\s+/i, '').replace(/[\r\n]+/g, '').trim();
writeToken(TOKEN);

function apiGet(url) {
  const current = readToken();
  return fetch(url, {
    headers: { Authorization: 'Bearer ' + current }
  }).then(async (res) => {
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt || 'Error'}`);
    }
    return res.json();
  });
}

// Si el backend responde { ok, data:{...} } uso data; si no, uso tal cual
function unwrap(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

document.getElementById('btnToken')?.addEventListener('click', () => {
  const nuevo = prompt('Ingresar accessToken:') || '';
  const limpio = nuevo.replace(/^Bearer\s+/i, '').replace(/[\r\n]+/g, '').trim();
  writeToken(limpio);
  location.reload();
});

// =======================================================
//  DOM refs
// =======================================================
const $usuarios  = document.getElementById("usuarios");
const $catalogo  = document.getElementById("catalogo");
const $turnos    = document.getElementById("turnos");
const $reservas  = document.getElementById("reservas");
const $listaProx = document.getElementById("listaProximas");

const ctxTurnos   = document.getElementById("graficoTurnos").getContext("2d");
const ctxReservas = document.getElementById("graficoReservas").getContext("2d");

let chartTurnos, chartReservas;

// =======================================================
//  RENDER RESUMEN  (adaptado a tu /resumen)
// =======================================================
function renderResumen(res) {
  // res = {
  //   usuarios: { total, clientes, empleados, administradores },
  //   catalogo: { servicios, salones },
  //   turnosHoy: { totales, reservados, disponibles, ocupacion },
  //   reservas: { hoy, mes, proximas: [] }
  // }

  const u = res.usuarios || {};
  $usuarios.innerHTML = `
    <h3>Usuarios</h3>
    <p>Total: <strong>${u.total ?? 0}</strong></p>
    <p>Clientes: ${u.clientes ?? 0}</p>
    <p>Empleados: ${u.empleados ?? 0}</p>
    <p>Administradores: ${u.administradores ?? 0}</p>
  `;

  const c = res.catalogo || {};
  $catalogo.innerHTML = `
    <h3>Catálogo</h3>
    <p>Salones activos: <strong>${c.salones ?? '-'}</strong></p>
    <p>Servicios activos: <strong>${c.servicios ?? '-'}</strong></p>
  `;

  const t = res.turnosHoy || {};
  const tot = t.totales ?? 0;
  const resv = t.reservados ?? 0;
  const disp = t.disponibles ?? Math.max(0, tot - resv);
  const ocup = t.ocupacion != null ? Number(t.ocupacion) : (tot > 0 ? (resv / tot) * 100 : 0);

  $turnos.innerHTML = `
    <h3>Turnos (Hoy)</h3>
    <p>Activos: <strong>${tot}</strong></p>
    <p>Reservados: <strong>${resv}</strong></p>
    <p>Disponibles: <strong>${disp}</strong></p>
    <p>Ocupación: <strong>${Math.round(ocup)}%</strong></p>
  `;

  const r = res.reservas || {};
  $reservas.innerHTML = `
    <h3>Reservas</h3>
    <p>Hoy: <strong>${r.hoy ?? '-'}</strong></p>
    <p>Mes actual: <strong>${r.mes ?? '-'}</strong></p>
  `;

  // Lista de próximas (viene en /resumen → reservas.proximas)
  renderProximas(r.proximas || []);
}

// =======================================================
//  RENDER LISTA PRÓXIMAS (desde /resumen)
// =======================================================
function renderProximas(lista) {
  $listaProx.innerHTML = "";
  if (!lista.length) {
    $listaProx.innerHTML = "<li>Sin reservas en los próximos 5 días</li>";
    return;
  }
  for (const r of lista) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${r.fecha_reserva}</strong> — ${r.salon} — ${r.cliente}`;
    $listaProx.appendChild(li);
  }
}

// =======================================================
//  RENDER GRÁFICOS (adaptado a /graficos)
// =======================================================
function renderGraficos(data) {
  // data = {
  //   reservasPorMes: [{ mes:"Oct", total:3 }, ...],
  //   reservasPorSalon: [{ salon:"Salón A", total: 4 }, ...]
  // }

  // Barras: reservas por salón (mes actual)
  const porSalon = data.reservasPorSalon || [];
  const labelsSalon = porSalon.map(x => x.salon);
  const valoresSalon = porSalon.map(x => x.total);

  if (chartTurnos) chartTurnos.destroy();
  chartTurnos = new Chart(ctxTurnos, {
    type: "bar",
    data: {
      labels: labelsSalon,
      datasets: [{ label: "Reservas por salón (mes actual)", data: valoresSalon }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Línea: reservas por mes (últimos n que devuelva tu API)
  const porMes = data.reservasPorMes || [];
  const labelsMes = porMes.map(x => x.mes);
  const valoresMes = porMes.map(x => x.total);

  if (chartReservas) chartReservas.destroy();
  chartReservas = new Chart(ctxReservas, {
    type: "line",
    data: {
      labels: labelsMes,
      datasets: [{ label: "Reservas por mes", data: valoresMes, tension: 0.3 }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// =======================================================
//  CARGA
// =======================================================
async function cargar() {
  try {
    const resumenRaw  = await apiGet("/api/v1/dashboard/resumen");
    const resumen     = unwrap(resumenRaw);
    renderResumen(resumen);

    const graficosRaw = await apiGet("/api/v1/dashboard/graficos");
    const graficos    = unwrap(graficosRaw);
    renderGraficos(graficos);
  } catch (e) {
    console.error(e);
    alert("Error al obtener datos del dashboard.\n" + e.message);
  }
}

cargar();
setInterval(cargar, 60000);

// Utilidades desde consola si expira o querés cambiar el token:
// sessionStorage.removeItem('dash.token'); location.reload();
