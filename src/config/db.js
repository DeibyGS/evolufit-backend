/**
 * DATABASE CONFIGURATION - EVOLUTFIT
 * Gestión de la conexión persistente con MongoDB Atlas mediante Mongoose.
 */

const mongoose = require("mongoose");

/**
 * Función asíncrona para inicializar la conexión con la base de datos.
 * Utiliza la URI almacenada en las variables de entorno para mayor seguridad.
 */
const connectDB = async () => {
  try {
    // 1. Intento de conexión utilizando el Driver de Mongoose.
    // Se recomienda que MONGO_URI incluya el nombre de la base de datos.
    await mongoose.connect(process.env.MONGO_URI);

    // Log de éxito para confirmación en el terminal de despliegue.
    console.log("✅ MongoDB connected");
  } catch (err) {
    // 2. Gestión de fallos críticos:
    // Si la conexión falla (por credenciales o red), se registra el error.
    console.error("❌ Error connecting to MongoDB:", err);

    /**
     * Finalización del proceso con código de salida 1 (error).
     * Esto evita que el servidor de Express intente arrancar sin una base de datos activa,
     * lo cual causaría errores en cascada en los controladores.
     */
    process.exit(1);
  }
};

module.exports = connectDB;
