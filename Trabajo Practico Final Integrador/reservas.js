import express from 'express';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { conexion } from './src/db/conexion.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Envío de notificaciones de reservas por correo
 */

/**
 * @swagger
 * /notificacion:
 *   post:
 *     summary: Envía un correo de notificación de nueva reserva
 *     tags: [Notificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - salon
 *               - turno
 *               - correoDestino
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2025-10-15"
 *               salon:
 *                 type: string
 *                 example: "Salón Fiesta Feliz"
 *               turno:
 *                 type: string
 *                 example: "Mañana"
 *               correoDestino:
 *                 type: string
 *                 example: "cliente@mail.com"
 *     responses:
 *       200:
 *         description: Correo enviado con éxito
 *       400:
 *         description: Faltan datos obligatorios
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del sistema
 */
router.post('/', async (req, res) => {
  const { fecha, salon, turno, correoDestino } = req.body;

  if (!fecha || !salon || !turno || !correoDestino) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios.' });
  }

  try {
    const [salonExiste] = await conexion.query('SELECT * FROM salones WHERE titulo=?', [salon]);
    if (salonExiste.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'Salón no encontrado.' });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const plantillaHbs = path.join(__dirname, './src/utiles/handlebars/plantilla.hbs');
    const hbsContent = await readFile(plantillaHbs, 'utf-8');

    const html = handlebars.compile(hbsContent)({
      fecha,
      salon,
      turno,
      url_ver_reserva: `http://localhost:3000/api/v1/salones/${salon}`
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    });

    await transporter.sendMail({
      to: correoDestino,
      subject: 'Notificación de Reserva - GrupoAO',
      html
    });

    res.json({ ok: true, mensaje: 'Correo enviado con éxito.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error interno del sistema.' });
  }
});

export default router;
