// src/controladores/reservasControlador.js
import { conexion as pool } from "../db/conexion.js";
import ReservasServicio from "../servicios/reservasServicio.js";
import { enviarCorreoReservaCliente, enviarCorreoNotificacionAdmin } from "../../reservas.js";
import PDFDocument from 'pdfkit';

export default class ReservasControlador {
  constructor() {
    this.reservasServicio = new ReservasServicio();
  }

  buscarReservas = async (req, res) => {
    try {
      const usuario = req.user;
      const reservas = usuario?.tipo_usuario === 3
        ? await this.reservasServicio.buscarReservasPorUsuario(usuario.usuario_id)
        : await this.reservasServicio.buscarReservas();
      res.json({ ok: true, reservas });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "ERROR al obtener las reservas." });
    }
  };

  buscarReservasPorId = async (req, res) => {
    try {
      const reserva = await this.reservasServicio.buscarReservasPorId(req.params.id);
      if (!reserva?.length) {
        return res.status(404).json({ ok: false, mensaje: "ERROR: La reserva no pudo ser encontrada." });
      }
      res.json({ ok: true, reserva });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "ERROR al obtener la reserva." });
    }
  };

  crearReservas = async (req, res) => {
    try {
      const { fecha_reserva, salon_id, turno_id, tematica, importe_total, servicios } = req.body;
      const usuario_id = req.user?.usuario_id;
      const emailCliente = req.body.correoDestino || req.user?.email;

      const nombreCliente = `${req.user?.nombre ?? ""} ${req.user?.apellido ?? ""}`.trim();

      if (!fecha_reserva || !salon_id || !turno_id || !tematica || !importe_total || !usuario_id) {
        return res.status(400).json({ ok: false, mensaje: "ERROR: Faltan datos obligatorios." });
      }

      const disponible = await this.reservasServicio.verificarDisponibilidad({ fecha_reserva, salon_id, turno_id });
      if (!disponible) {
        return res.status(400).json({ ok: false, mensaje: "ERROR: El salón ya está reservado para esa fecha y turno." });
      }

      const reserva_id = await this.reservasServicio.crearReservas({
        fecha_reserva,
        salon_id,
        usuario_id,
        turno_id,
        tematica,
        importe_total,
        servicios,
      });

      // Envío de correos
      try {
        if (emailCliente) {
          await enviarCorreoReservaCliente(emailCliente, {
            salon: `Salón #${salon_id}`,
            fecha: fecha_reserva,
            horario: `Turno #${turno_id}`,
            tematica,
          });
          console.log("Correo de confirmación al cliente enviado:", emailCliente);
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await enviarCorreoNotificacionAdmin(adminEmail, {
            cliente: nombreCliente || req.user?.nombre_usuario || `Usuario ${usuario_id}`,
            fecha: fecha_reserva,
            salon: `Salón #${salon_id}`,
            horario: `Turno #${turno_id}`,
            tematica,
            reserva_id,
          });
          console.log("Correo de notificación al admin enviado:", adminEmail);
        }
      } catch (error) {
        console.error("Error al enviar correos de reserva:", error);
      }

      res.status(201).json({ ok: true, mensaje: "Reserva creada con éxito.", reserva_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "ERROR al crear la reserva." });
    }
  };

  modificarReservas = async (req, res) => {
    try {
      const { reserva_id, fecha_reserva, turno_id, tematica, importe_total } = req.body;
      if (!reserva_id) {
        return res.status(400).json({ ok: false, mensaje: "ERROR: Falta el ID de la reserva." });
      }

      const reservaActual = await this.reservasServicio.buscarReservasPorId(reserva_id);
      if (!reservaActual?.length) {
        return res.status(404).json({ ok: false, mensaje: "ERROR: La reserva no existe." });
      }

      const camposActualizables = {};
      if (fecha_reserva) camposActualizables.fecha_reserva = fecha_reserva;
      if (turno_id) camposActualizables.turno_id = turno_id;
      if (tematica) camposActualizables.tematica = tematica;
      if (importe_total) camposActualizables.importe_total = importe_total;

      if (!Object.keys(camposActualizables).length) {
        return res.status(400).json({ ok: false, mensaje: "ERROR: No se enviaron campos válidos para modificar." });
      }

      camposActualizables.reserva_id = reserva_id;
      const affected = await this.reservasServicio.modificarReservas(camposActualizables);

      if (!affected) {
        return res.status(404).json({ ok: false, mensaje: "ERROR: La reserva no pudo ser modificada." });
      }

      res.json({ ok: true, mensaje: "Reserva modificada con éxito." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "ERROR al modificar la reserva." });
    }
  };

  eliminarReservas = async (req, res) => {
    try {
      const reserva_id = req.params.id;
      const affected = await this.reservasServicio.eliminarReservas(reserva_id);
      if (!affected) {
        return res.status(404).json({ ok: false, mensaje: "ERROR: La reserva no pudo ser encontrada." });
      }
      res.json({ ok: true, mensaje: "Reserva eliminada con éxito." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: "ERROR al eliminar la reserva." });
    }
  };

  obtenerEstadisticas = async (req, res) => {
    try {
      const [result] = await pool.query("CALL estadisticas_reservas_por_mes()");
      res.status(200).json({ ok: true, estadisticas: result[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: error.message });
    }
  };

  generarPDFReservas = async (req, res) => {
    try {
      const [result] = await pool.query("CALL obtener_reservas_pdf()");
      const reservas = result[0];

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=reservas.pdf');
      doc.pipe(res);

      doc.fontSize(18).text('📋 Reporte de Reservas', { align: 'center' }).moveDown();

      reservas.forEach((r) => {
        doc.fontSize(12).text(`Reserva #${r.reserva_id}`);
        doc.text(`Cliente: ${r.cliente_nombre} ${r.cliente_apellido}`);
        doc.text(`Salón: ${r.salon_titulo}`);
        doc.text(`Dirección: ${r.salon_direccion}`);
        doc.text(`Fecha: ${r.fecha_reserva}`);
        doc.text(`Horario: ${r.hora_desde} - ${r.hora_hasta}`);
        doc.text(`Temática: ${r.tematica}`);
        doc.text(`Importe Total: $${r.importe_total}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  };
}
