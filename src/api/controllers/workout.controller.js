/**
 * WORKOUT & ANALYTICS CONTROLLER - EVOLUTFIT
 * Gestión de sesiones de entrenamiento y procesamiento de Big Data para estadísticas.
 */

const Workout = require("../models/workout.model");
const mongoose = require("mongoose");

/**
 * Registra una sesión de entrenamiento completada.
 * Se ejecuta cuando el usuario finaliza su rutina en el Frontend.
 */
const createWorkout = async (req, res) => {
  try {
    // Vinculación forzosa con el ID del usuario autenticado para integridad de datos.
    const newWorkout = new Workout({
      ...req.body,
      userId: req.user._id,
    });

    const savedWorkout = await newWorkout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al guardar la rutina", error: error.message });
  }
};

/**
 * Recupera el historial de entrenamientos del usuario.
 * Ordenado por fecha descendente para mostrar lo más reciente primero.
 */
const getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json(workouts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener historial", error: error.message });
  }
};

/**
 * Obtiene el detalle expandido de una sesión específica.
 */
const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    // Verificación cruzada de ID y propiedad del usuario.
    const workout = await Workout.findOne({ _id: id, userId: req.user._id });

    if (!workout) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }
    res.status(200).json(workout);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la rutina", error: error.message });
  }
};

/**
 * Elimina un registro de entrenamiento del historial.
 */
const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Workout.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "No se encontró la rutina para eliminar" });
    }
    res.status(200).json({ message: "Rutina eliminada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar", error: error.message });
  }
};

/**
 * Genera métricas avanzadas para visualización en Dashboards (Recharts).
 * Calcula distribución muscular y progresión de volumen mediante pipelines de agregación.
 */
const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // A. Distribución por Grupos Musculares (Gráfica Circular/Pie Chart)
    // Calcula la densidad de entrenamiento por cada grupo muscular.
    const muscleDistribution = await Workout.aggregate([
      { $match: { userId } },
      { $unwind: "$exercises" }, // Desglosa el array de ejercicios
      {
        $group: {
          _id: "$exercises.muscleGroup",
          totalReps: {
            $sum: {
              $reduce: {
                // Suma las repeticiones de todos los sets de forma eficiente
                input: "$exercises.sets",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.reps"] },
              },
            },
          },
        },
      },
    ]);

    // B. Progresión de Volumen de Trabajo (Gráfica de Líneas)
    // Fórmula: Volumen = Peso * Repeticiones por sesión.
    const volumeProgress = await Workout.aggregate([
      { $match: { userId } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: {
            fecha: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            grupo: "$exercises.muscleGroup",
            ejercicio: "$exercises.exerciseName",
          },
          volumenSesion: {
            $sum: {
              $multiply: ["$exercises.sets.reps", "$exercises.sets.weight"],
            },
          },
        },
      },
      { $sort: { "_id.fecha": 1 } },
    ]);

    res.status(200).json({
      muscleDistribution,
      volumeProgress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al generar estadísticas", error: error.message });
  }
};

/**
 * Calcula la carga total acumulada (Tonnage) por el usuario.
 * Crucial para el sistema de logros y medallas (ej: Fuerza de un F-16).
 */
const getTotalVolume = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Workout.aggregate([
      // 1. Filtrado de documentos por usuario
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      // 2. Proceso de aplanamiento de sub-documentos anidados
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      // 3. Reducción matemática para obtener el peso total absoluto
      {
        $group: {
          _id: null,
          totalVolume: {
            $sum: {
              $multiply: ["$exercises.sets.reps", "$exercises.sets.weight"],
            },
          },
        },
      },
    ]);

    // Normalización de la respuesta para usuarios sin registros.
    const total = result.length > 0 ? result[0].totalVolume : 0;

    res.status(200).json({ totalWeight: total });
  } catch (error) {
    console.error("Error en getTotalVolume:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  createWorkout,
  getMyWorkouts,
  getWorkoutById,
  deleteWorkout,
  getWorkoutStats,
  getTotalVolume,
};
