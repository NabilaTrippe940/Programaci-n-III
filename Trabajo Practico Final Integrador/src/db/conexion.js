//Src/Db/Conexion.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conexion.getConnection()
  .then(conn => {
    console.log("POOL de MySQL Creado Con Éxito.");
    conn.release();
  })
  .catch(err => {
    console.error("Error al Crear el POOL de MySQL: ", err.message || err);
  });