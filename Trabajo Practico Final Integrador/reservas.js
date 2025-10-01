import express from 'express';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { conexion } from './src/db/conexion.js';


const router = express.Router();

router.post('/', async (req, res) => { // POST http://localhost:3000/api/v1/notificacion
  const { fecha, salon, turno, correoDestino } = req.body;
  if (!fecha || !salon || !turno || !correoDestino)
    return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan Datos Obligatorios.' });

  try {
    const [salonExiste] = await conexion.query('SELECT * FROM salones WHERE titulo=?', [salon]);
    if (salonExiste.length === 0) return res.status(404).json({ ok: false, mensaje: 'ERROR: El Salón No Pudo Ser Encontrado.' });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const plantillaHbs = path.join(__dirname, './src/utiles/handlebars/plantilla.hbs');
    const hbsContent = await readFile(plantillaHbs, 'utf-8');
    const html = handlebars.compile(hbsContent)({ fecha, salon, turno });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.USER, pass: process.env.PASS }
    });

    await transporter.sendMail({ to: correoDestino, subject: 'Notificación de reserva', html });
    res.json({ ok: true, mensaje: 'Correo Enviado Con Exito.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'ERROR en el Sistema.' });
  }
});

export default router;