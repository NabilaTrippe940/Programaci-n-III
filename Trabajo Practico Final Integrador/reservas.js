//Reservas.js - Notificaciones
import express from 'express';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { body, validationResult } from "express-validator";
import { conexion } from './src/db/conexion.js';
import { authenticateJWT } from './src/middlewares/authenticateJWT.js';
import { permit } from './src/middlewares/roles.js';

const router = express.Router();

router.post(
  '/',
  authenticateJWT,
  permit(1, 2),
  [
    body("fecha").notEmpty().withMessage("La fecha es obligatoria"),
    body("titulo").notEmpty().withMessage("El título del salón es obligatorio"),
    body("turno").notEmpty().withMessage("El turno es obligatorio"),
    body("correoDestino").isEmail().withMessage("Formato de correo inválido"),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ ok: false, errores: errores.array() });
    }

    const { fecha, titulo, turno, correoDestino } = req.body;

    try {
      const [salonExiste] = await conexion.query(
        'SELECT * FROM salones WHERE titulo = ?',
        [titulo]
      );
      if (!salonExiste?.length) {
        return res.status(404).json({ ok: false, mensaje: 'Salón no encontrado.' });
      }

      await enviarCorreoReservaCliente(correoDestino, { fecha, titulo, turno });

      res.json({ ok: true, mensaje: 'Correo enviado con éxito.' });
    } catch (err) {
      console.error("Error en notificación:", err);
      res.status(500).json({ ok: false, mensaje: 'Error interno del sistema.' });
    }
  }
);

export default router;

async function generarHTMLCorreo({ fecha, titulo, turno, extra = "" }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const plantillaPath = path.join(__dirname, './src/utiles/handlebars/plantilla.hbs');
  const hbsContent = await readFile(plantillaPath, 'utf-8');

  return handlebars.compile(hbsContent)({
    fecha,
    titulo,
    turno,
    extra,
    url_ver_reserva: `http://localhost:3000/api/v1/salones/${encodeURIComponent(titulo)}`
  });
}

export async function enviarCorreoReservaCliente(correoDestino, { fecha, titulo, turno }) {
  const html = await generarHTMLCorreo({ fecha, titulo, turno });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  });

  await transporter.sendMail({
    from: `"Reservas App" <${process.env.USER}>`,
    to: correoDestino,
    subject: '📅 Confirmación de Reserva',
    html
  });
}

export async function enviarCorreoNotificacionAdmin(correoDestino, { cliente, fecha, salon, horario, tematica, reserva_id }) {
  const html = await generarHTMLCorreo({
    fecha,
    titulo: salon,
    turno: horario,
    extra: `Cliente: ${cliente}<br>Temática: ${tematica}<br>ID Reserva: ${reserva_id}`
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  });

  await transporter.sendMail({
    from: `"Reservas App" <${process.env.USER}>`,
    to: correoDestino,
    subject: '📢 Nueva reserva creada',
    html
  });
}