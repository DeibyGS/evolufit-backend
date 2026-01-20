/**
 * MAIN SERVER ENTRY POINT - EVOLUTFIT
 * Orquestador principal de la API. Configura el servidor, la base de datos y las rutas.
 */

require("dotenv").config(); // Carga las variables de entorno (PORT, MONGO_URI, JWT_SECRET)
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");

// Importación de Routers
const userRouter = require("./src/api/routes/user.router");
const authRouter = require("./src/api/routes/auth.router");
const workoutRouter = require("./src/api/routes/workout.router");
const rmRouter = require("./src/api/routes/rm.router");
const healthRouter = require("./src/api/routes/health.route");
const socialRouter = require("./src/api/routes/social.router");

/**
 * CONFIGURACIÓN DE CORS
 * Permite que tu frontend (ej. desde Vercel o localhost) se comunique con este servidor.
 * origin: "*" permite acceso desde cualquier origen (ideal para desarrollo y despliegue inicial).
 */
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const app = express();

// MIDDLEWARES GLOBALES
app.use(express.json()); // Permite recibir y procesar datos en formato JSON en el req.body
connectDB(); // Inicializa la conexión con MongoDB Atlas
app.use(cors(corsOptions)); // Aplica la política de intercambio de recursos

// REGISTRO DE RUTAS (VERSIONADO DE API)
// Cada módulo tiene su propio prefijo para mantener la organización REST.
app.use("/api/auth", authRouter); // Registro y Login
app.use("/api/users", userRouter); // Gestión de perfiles
app.use("/api/workouts", workoutRouter); // Historial y estadísticas de entreno
app.use("/api/rm", rmRouter); // Marcas personales y Leaderboard
app.use("/api/health", healthRouter); // Métricas de salud (IMC, TDEE)
app.use("/api/social", socialRouter); // Feed comunitario y rutinas compartidas

/**
 * MANEJO DE RUTAS NO ENCONTRADAS (404)
 * Actúa como un "catch-all" para cualquier petición a un endpoint inexistente.
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

/**
 * INICIALIZACIÓN DEL SERVIDOR
 * El puerto se toma de las variables de entorno (necesario para Render/Railway) o usa el 3000 por defecto.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port http://localhost:${PORT}`);
});
