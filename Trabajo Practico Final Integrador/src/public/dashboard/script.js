const STORE = window.sessionStorage;              
const TOKEN_KEY = 'dash.token';                   

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
  return fetch(url, { headers: { Authorization: 'Bearer ' + current } })
    .then(async (res) => {
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} - ${txt || 'Error'}`);
      }
      return res.json();
    });
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
}

document.getElementById('btnToken')?.addEventListener('click', () => {
  const nuevo = prompt('Ingresar accessToken:') || '';
  const limpio = nuevo.replace(/^Bearer\s+/i, '').replace(/[\r\n]+/g, '').trim();
  writeToken(limpio);
  location.reload();
});

const $usuarios  = document.getElementById("usuarios");
const $catalogo  = document.getElementById("catalogo");
const $turnos    = document.getElementById("turnos");
const $reservas  = document.getElementById("reservas");
const $listaProx = document.getElementById("listaProximas");


const $cvTurnos   = document.getElementById("graficoTurnos");
const $cvReservas = document.getElementById("graficoReservas");
const ctxTurnos   = $cvTurnos.getContext("2d");
const ctxReservas = $cvReservas.getContext("2d");

let chartSalonMes = null;
let chartSerieReservas = null;


function cssVar(name, fallback = '') {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v || fallback).toString().trim();
}

const COLORS = {
  axis: "#f3ecff",
  grid: "rgba(255,255,255,0.18)",
  barFill: "rgba(255, 91, 189, 0.60)",  
  barStroke: "rgba(255, 91, 189, 1)",
  lineStroke: "rgba(255, 135, 210, 1)",
  lineFill: "rgba(255, 135, 210, 0.20)",
  pointBorder: "rgba(255, 135, 210, 1)"
};

function setCardHTML($el, inner) {
  const body = $el?.querySelector('.card-body');
  if (body) body.innerHTML = inner;
  else if ($el) $el.innerHTML = inner;
}

function wipeCanvas(ctx) {
  const canvas = ctx.canvas;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
}

function formatearFechaLocal(isoString, incluirHora = true) {
  const d = new Date(isoString);
  if (isNaN(d)) return isoString; 
  const fecha = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (!incluirHora) return fecha;
  const hora  = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${fecha} — ${hora} hs`;
}

function renderResumen(res) {
  const u = res.usuarios || {};
  setCardHTML($usuarios, `
    <ul class="mini">
      <li><span class="hint">Total:</span> <span class="kpi">${u.total ?? 0}</span></li>
      <li>Clientes: <strong>${u.clientes ?? 0}</strong></li>
      <li>Empleados: <strong>${u.empleados ?? 0}</strong></li>
      <li>Administradores: <strong>${u.administradores ?? 0}</strong></li>
    </ul>
  `);

  const c = res.catalogo || {};
  setCardHTML($catalogo, `
    <ul class="mini">
      <li>Servicios activos: <span class="kpi">${c.servicios ?? '-'}</span></li>
      <li>Salones activos: <span class="kpi">${c.salones ?? '-'}</span></li>
    </ul>
  `);

  const t = res.turnosHoy || {};
  const tot = t.totales ?? 0;
  const resv = t.reservados ?? 0;
  const disp = t.disponibles ?? Math.max(0, tot - resv);
  const ocup = t.ocupacion != null ? Number(t.ocupacion) : (tot > 0 ? (resv / tot) * 100 : 0);

  setCardHTML($turnos, `
    <ul class="mini">
      <li>Activos: <span class="kpi">${tot}</span></li>
      <li>Reservados: <strong>${resv}</strong></li>
      <li>Disponibles: <strong>${disp}</strong></li>
      <li>Ocupación: <strong>${Math.round(ocup)}%</strong></li>
    </ul>
  `);

  const r = res.reservas || {};
  setCardHTML($reservas, `
    <ul class="mini">
      <li>Hoy: <span class="kpi">${r.hoy ?? '-'}</span></li>
      <li>Mes actual: <span class="kpi">${r.mes ?? '-'}</span></li>
    </ul>
  `);

  renderProximas(r.proximas || []);
}

function renderProximas(lista) {
  $listaProx.innerHTML = "";
  if (!lista.length) {
    $listaProx.innerHTML = "<li>Sin reservas en los próximos 5 días</li>";
    return;
  }

  for (const r of lista) {
    const fecha = formatearFechaLocal(r.fecha_reserva ?? "-", false);
    const salon = r.salon ?? r.titulo ?? "—";
    const procesadoPor =
      r.procesado_por || r.empleado || r.admin || r.usuario || r.cliente || "—";

    const tematica = r.tematica ? ` — <em>${r.tematica}</em>` : "";

    const li = document.createElement("li");
    li.innerHTML =
      `<span class="label">Fecha reserva:</span> <strong>${fecha}</strong>` +
      ` — <span class="label">Salón:</span> <strong>${salon}</strong>` +
      ` — <span class="label">Reserva procesada por:</span> <strong>${procesadoPor}</strong>` +
      tematica;

    $listaProx.appendChild(li);
  }
}

function renderGraficos(data) {
  const porSalon = data.reservasPorSalon
                || data?.reservas?.porSalonMesActual
                || data?.reservas?.porSalon
                || [];

  const labelsSalon  = porSalon.map(x => x.salon || x.titulo || '—');
  const valoresSalon = porSalon.map(x => Number(x.total ?? x.cantidad ?? 0));
  const maxSalon = valoresSalon.length ? Math.max(...valoresSalon) : 0;
  const suggestedMaxSalon = Math.max(5, maxSalon + 1);

  if (chartSalonMes) chartSalonMes.destroy();
  if (!labelsSalon.length) wipeCanvas(ctxTurnos);
  else {
    const gradBar = ctxTurnos.createLinearGradient(0, 0, 0, $cvTurnos.height);
    gradBar.addColorStop(0, "rgba(255, 91, 189, 0.85)");
    gradBar.addColorStop(1, "rgba(255, 91, 189, 0.40)");

    chartSalonMes = new Chart(ctxTurnos, {
      type: "bar",
      data: {
        labels: labelsSalon,
        datasets: [{
          label: "Reservas por salón (mes actual)",
          data: valoresSalon,
          backgroundColor: gradBar,
          borderColor: COLORS.barStroke,
          borderWidth: 2,
          borderRadius: 8,
          maxBarThickness: 46
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { ticks: { color: COLORS.axis }, grid: { display: false } },
          y: {
            beginAtZero: true,
            suggestedMax: suggestedMaxSalon,
            ticks: {
              color: COLORS.axis,
              stepSize: 1,
              precision: 0,
              callback: (value) => Number.isInteger(value) ? value : ''
            },
            grid: { color: COLORS.grid }
          }
        }
      }
    });
  }

  const serieMes = data.reservasPorMes
                || data?.reservas?.porMes
                || data?.reservas?.ultimos12Meses
                || [];

  const labelsMes  = serieMes.map(r => r.mes || r.label || `${r.anio ?? ''}-${String(r.nro_mes ?? '').padStart(2,'0')}`.trim());
  const valoresMes = serieMes.map(r => Number(r.total ?? r.cantidad ?? 0));
  const maxMes = valoresMes.length ? Math.max(...valoresMes) : 0;
  const suggestedMaxMes = Math.max(5, maxMes + 1);

  if (chartSerieReservas) chartSerieReservas.destroy();
  if (!labelsMes.length) wipeCanvas(ctxReservas);
  else {
    const gradLine = ctxReservas.createLinearGradient(0, 0, 0, $cvReservas.height);
    gradLine.addColorStop(0, COLORS.lineFill);
    gradLine.addColorStop(1, "rgba(255,255,255,0.02)");

    chartSerieReservas = new Chart(ctxReservas, {
      type: "line",
      data: {
        labels: labelsMes,
        datasets: [{
          label: "Reservas por mes",
          data: valoresMes,
          borderWidth: 3,
          borderColor: COLORS.lineStroke,
          backgroundColor: gradLine,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: COLORS.pointBorder,
          pointRadius: 4,
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: COLORS.axis }, grid: { display: false } },
          y: {
            beginAtZero: true,
            suggestedMax: suggestedMaxMes,
            ticks: {
              color: COLORS.axis,
              stepSize: 1,
              precision: 0,
              callback: (value) => Number.isInteger(value) ? value : ''
            },
            grid: { color: COLORS.grid }
          }
        }
      }
    });
  }
}

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

