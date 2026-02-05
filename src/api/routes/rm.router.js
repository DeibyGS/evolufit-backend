/**
 * RM & LEADERBOARD ROUTER - EVOLUTFIT
 * Definición de endpoints para el registro de marcas personales y acceso al ranking global.
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
 * @route   POST /api/v1/rm
 * @desc    Registra una nueva marca de RM (1 Repetición Máxima).
 * @access  Privado
 */
rmRouter.post("/", isAuth, validate(rmValidatorSchema), saveRM);

/**
 * @route   GET /api/v1/rm
 * @desc    Obtiene el historial de marcas personales del usuario autenticado.
 * @access  Privado
 */
rmRouter.get("/", isAuth, getMyRMs);

/**
 * @route   DELETE /api/v1/rm/:id
 * @desc    Elimina un registro de RM específico del historial personal.
 * @access  Privado
 */
rmRouter.delete("/:id", isAuth, deleteRM);

/**
 * @route   GET /api/v1/rm/leaderboard
 * @desc    Obtiene el ranking global de los mejores levantamientos por ejercicio.
 * @access  Privado (Solo usuarios registrados pueden ver el Hall of Fame)
 */
rmRouter.get("/leaderboard", isAuth, getLeaderboard);

/**
 * Exportación del router para su integración en la API central.
 */
module.exports = rmRouter;
