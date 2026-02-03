/**
 * WORKOUT & ANALYTICS ROUTER - EVOLUTFIT
 * Definición de endpoints para el registro de sesiones y la obtención de métricas de rendimiento.
 */

const { isAuth } = require("../../middlewares/auth");
const validate = require("../../../utils/validate");
const { workoutValidatorSchema } = require("../../validators/workoutValidator");
const {
  createWorkout,
  getMyWorkouts,
  getWorkoutById,
  deleteWorkout,
  getWorkoutStats,
  getTotalVolume,
} = require("../controllers/workout.controller");

// Inicialización del router de Express
const workoutRouter = require("express").Router();

/**
 * @route   POST /api/v1/workout
 * @desc    Registra una nueva sesión de entrenamiento completada.
 * @access  Privado (isAuth garantiza que el registro pertenezca al usuario del token)
 */
workoutRouter.post(
  "/",
  isAuth,
  validate(workoutValidatorSchema),
  createWorkout,
);

/**
 * @route   GET /api/v1/workout/my-workouts
 * @desc    Recupera el listado completo de sesiones en el historial del usuario.
 * @access  Privado
 */
workoutRouter.get("/my-workouts", isAuth, getMyWorkouts);

/**
 * @route   GET /api/v1/workout/stats
 * @desc    Endpoint analítico: Distribución muscular y progresión de volumen para Dashboards.
 * @access  Privado
 */
workoutRouter.get("/stats", isAuth, getWorkoutStats);

/**
 * @route   GET /api/v1/workout/total-volume
 * @desc    Obtiene la sumatoria absoluta de peso levantado (Tonnage) para el sistema de logros.
 * @access  Privado
 */
workoutRouter.get("/total-volume", isAuth, getTotalVolume);

/**
 * @route   GET /api/v1/workout/:id
 * @desc    Obtiene el desglose detallado (ejercicios y series) de una rutina específica.
 * @access  Privado
 */
workoutRouter.get("/:id", isAuth, getWorkoutById);

/**
 * @route   DELETE /api/v1/workout/:id
 * @desc    Elimina un registro de entrenamiento del historial.
 * @access  Privado
 */
workoutRouter.delete("/:id", isAuth, deleteWorkout);

/**
 * Exportación para la integración en la infraestructura global de rutas.
 */
module.exports = workoutRouter;
