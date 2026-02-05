/**
 * HEALTH ROUTER - EVOLUTFIT
 * Definición de rutas protegidas para la gestión del historial biométrico.
 */
const validate = require("../../../utils/validate");
const { healthValidatorSchema } = require("../../validators/healthValidator");
const { isAuth } = require("../../middlewares/auth");

const {
  getAllHealthRecords,
  saveHealthRecord,
  deleteHealthRecord,
} = require("../controllers/health.controller");

// Inicialización del router de Express
const healthRouter = require("express").Router();

/**
 * @route   POST /api/v1/health
 * @desc    Registra un nuevo cálculo de salud (IMC, TDEE, etc.)
 * @access  Privado (Requiere Token)
 */
healthRouter.post(
  "/",
  isAuth,
  validate(healthValidatorSchema),
  saveHealthRecord,
);

/**
 * @route   GET /api/v1/health
 * @desc    Recupera el historial biométrico completo del usuario autenticado
 * @access  Privado (Requiere Token)
 */
healthRouter.get("/", isAuth, getAllHealthRecords);

/**
 * @route   DELETE /api/v1/health/:id
 * @desc    Elimina un registro específico del historial
 * @access  Privado (Requiere Token)
 */
healthRouter.delete("/:id", isAuth, deleteHealthRecord);

/**
 * Exportación del router para su integración en el orquestador principal de rutas.
 */
module.exports = healthRouter;
