import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PUERTO || 3000;
app.listen(PORT, () => {
  console.log(`SERVIDOR INICIADO CORRECTAMENTE - RUTA: http://localhost:${PORT}`);
});

// C:\Users\franc\OneDrive\Desktop\Trabajo Práctico JS - Repo\Programaci-n-III\Trabajo Practico Final Integrador