import express from 'express';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { conexion } from './src/db/conexion.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { fecha, salon, turno, correoDestino } = req.body;
  if (!fecha || !salon || !turno || !correoDestino)
    return res.status(400).json({ ok: false, mensaje: 'ERROR: Faltan datos obligatorios.' });

  try {
    const [salonExiste] = await conexion.query('SELECT * FROM salones WHERE titulo=?', [salon]);
    if (salonExiste.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'ERROR: El salón no pudo ser encontrado.' });

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

    console.log(`Reserva enviada a ${correoDestino} para el salón ${salon} el día ${fecha} en turno ${turno}.`);
    res.json({ ok: true, mensaje: 'Correo enviado con éxito.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'ERROR en el sistema.' });
  }
});

export default router;
