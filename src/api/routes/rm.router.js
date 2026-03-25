/**
 * ROUTER DE 1RM Y LEADERBOARD - EVOLUTFIT
 * Endpoints para registrar récords de fuerza personales y consultar el ranking global.
 * Todas las rutas son privadas (requieren isAuth).
 */
const { rmValidatorSchema } = require("../../validators/rmValidator");
const validate = require("../../../utils/validate");
const { isAuth } = require("../../middlewares/auth");
const {
  saveRM,
  getMyRMs,
  deleteRM,
  getLeaderboard,
} = require("../controllers/rm.controller");

// Inicialización del router de Express
const rmRouter = require("express").Router();

/**
 * @route   GET /api/rm/leaderboard
 * @desc    Ranking global de 1RM por ejercicio (paginado). Se define antes que GET /
 *          para evitar que Express interprete "leaderboard" como un :id de parámetro.
 */
rmRouter.get("/leaderboard", isAuth, getLeaderboard);

/** @route   GET /api/rm — Historial personal de récords del usuario autenticado */
rmRouter.get("/", isAuth, getMyRMs);

/** @route   POST /api/rm — Guarda un nuevo cálculo de 1RM con detección de récord personal */
rmRouter.post("/", isAuth, validate(rmValidatorSchema), saveRM);

/** @route   DELETE /api/rm/:id — Elimina un registro de 1RM del historial */
rmRouter.delete("/:id", isAuth, deleteRM);

/**
 * Exportación del router para su integración en la API central.
 */
module.exports = rmRouter;
