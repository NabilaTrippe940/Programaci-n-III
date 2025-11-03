// Reservas.js
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fecha, titulo, turno, correoDestino]
 *             properties:
 *               fecha: { type: string, example: "2025-10-20" }
 *               titulo: { type: string, example: "Salón Fiesta Feliz" }
 *               turno: { type: string, example: "Mañana" }
 *               correoDestino: { type: string, format: email, example: "cliente@mail.com" }
 *     responses:
 *       200: { description: "Correo enviado con éxito" }
 *       400: { description: "Faltan datos obligatorios o formato inválido" }
 *       404: { description: "Salón no encontrado" }
 *       500: { description: "Error interno del sistema" }
 */

router.post(
  '/',
  authenticateJWT,
  permit(1, 2), // Solo Admin (1) y Empleado (2)
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
        'SELECT * FROM salones WHERE titulo=?',
        [titulo]
      );
      if (salonExiste.length === 0)
        return res.status(404).json({ ok: false, mensaje: 'Salón no encontrado.' });

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const plantillaHbs = path.join(__dirname, './src/utiles/handlebars/plantilla.hbs');
      const hbsContent = await readFile(plantillaHbs, 'utf-8');

      const html = handlebars.compile(hbsContent)({
        fecha,
        titulo,
        turno,
        url_ver_reserva: `http://localhost:3000/api/v1/salones/${titulo}`
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.USER, pass: process.env.PASS }
      });

      await transporter.sendMail({
        to: correoDestino,
        subject: 'Notificación de Reserva',
        html
      });

      res.json({ ok: true, mensaje: 'Correo enviado con éxito.' });
    } catch (err) {
      console.error("Error en notificación:", err);
      res.status(500).json({ ok: false, mensaje: 'Error interno del sistema.' });
    }
  }
);

export default router;