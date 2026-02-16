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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Bloqueado por CORS: Origen no permitido - ${origin}`);
      callback(new Error("Acceso denegado por políticas de CORS de EvolutFit"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
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
// ... (tus rutas anteriores)

/**
 * MANEJO DE RUTAS NO ENCONTRADAS (404)
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

/**
 * MIDDLEWARE DE MANEJO DE ERRORES GLOBAL (AÑADE ESTO)
 * Express detecta que es un manejador de errores porque tiene 4 parámetros (err, req, res, next)
 */
app.use((err, req, res, next) => {
  console.error("❌ ERROR DEL SERVIDOR:", err.stack);

  // Si el error ocurrió después de que la respuesta ya se envió, delegamos al default
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

/**
 * INICIALIZACIÓN DEL SERVIDOR
 * El puerto se toma de las variables de entorno (necesario para Render/Railway) o usa el 3000 por defecto.
 */
const PORT = process.env.PORT || 8080;
const isDev = process.env.NODE_ENV !== "production";

// Usamos "0.0.0.0" para que Render pueda exponer el servicio correctamente
app.listen(PORT, "0.0.0.0", () => {
  const host = isDev ? `http://localhost:${PORT}` : "Production Server";
  console.log(
    `🚀 Server running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode`,
  );
  console.log(`🔗 URL: ${host}`);
});
