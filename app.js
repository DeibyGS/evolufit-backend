/**
 * APP CONFIGURATION - EVOLUTFIT
 * Express app configurado y exportado sin iniciar el servidor.
 * Separado de index.js para permitir testing con Supertest sin levantar un puerto real.
 */

const express = require("express");
const cors = require("cors");

// Routers
const userRouter = require("./src/api/routes/user.router");
const authRouter = require("./src/api/routes/auth.router");
const workoutRouter = require("./src/api/routes/workout.router");
const rmRouter = require("./src/api/routes/rm.router");
const healthRouter = require("./src/api/routes/health.route");
const socialRouter = require("./src/api/routes/social.router");

const app = express();

// CORS — en tests, ALLOWED_ORIGINS estará vacío, lo que permite cualquier origen
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Acceso denegado por políticas de CORS de EvolutFit"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middlewares globales
app.use(express.json());
app.use(cors(corsOptions));

// Rutas
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/rm", rmRouter);
app.use("/api/health", healthRouter);
app.use("/api/social", socialRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Error handler global
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
