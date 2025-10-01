import express from 'express';
import salonesRutas from './src/v1/rutas/salonesRutas.js';
import reservaRutas from './reservas.js';

const app = express();
app.use(express.json());

app.get('/estado', (req, res) => { // GET http://localhost:3000/estado
  res.json({ ok: true, mensaje: 'SERVIDOR EN FUNCIONAMENTO...' });
});

app.use('/api/v1/salones', salonesRutas);
app.use('/api/v1/notificacion', reservaRutas);

export default app;