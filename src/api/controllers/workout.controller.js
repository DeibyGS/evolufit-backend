/**
 * CONTROLADOR DE ENTRENAMIENTOS Y ANALÍTICAS - EVOLUTFIT
 * Gestiona las sesiones de entrenamiento y genera estadísticas
 * mediante pipelines de agregación de MongoDB para los dashboards.
 */

const Workout = require("../models/workout.model");
const mongoose = require("mongoose");

/**
 * Registra una sesión de entrenamiento completada por el usuario.
 *
 * @decision El `userId` se toma del token (req.user._id) y NO del body,
 *           para evitar que un usuario pueda guardar entrenamientos a nombre de otro.
 *           El frontend no necesita enviar el userId.
 *
 * @param {import('express').Request} req - Body: ejercicios, duración, etc. del workout.
 * @param {import('express').Response} res
 */
const createWorkout = async (req, res) => {
  try {
    // El spread del body incluye todos los campos del entrenamiento,
    // pero se sobreescribe userId con el del token para garantizar integridad.
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
 * Recupera el historial de entrenamientos del usuario con paginación.
 * URL: GET /api/v1/workouts/my-workouts?page=1&limit=5
 *
 * @decision Se usa paginación con skip/limit en lugar de cursor-based pagination
 *           porque el frontend necesita saber el número total de páginas para
 *           renderizar la UI de paginación (totalPages, hasNextPage).
 *
 * @decision Se ordena por `createdAt` (timestamp de inserción en BD) en lugar de
 *           un campo `date` del body, porque `createdAt` es inmutable y más fiable.
 *
 * @param {import('express').Request} req - Query params opcionales: page, limit.
 * @param {import('express').Response} res
 */
const getMyWorkouts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Se necesita el total real (sin skip/limit) para calcular cuántas páginas hay
    const total = await Workout.countDocuments({ userId: req.user._id });

    res.status(200).json({
      workouts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener historial", error: error.message });
  }
};

/**
 * Obtiene el detalle completo de una sesión de entrenamiento específica.
 *
 * @decision La búsqueda combina `_id` y `userId` en un único `findOne` en lugar
 *           de buscar solo por ID. Esto evita que un usuario pueda acceder al
 *           detalle de entrenamientos ajenos si conoce el ObjectId (IDOR attack).
 *
 * @param {import('express').Request} req - Params: id (ObjectId del workout).
 * @param {import('express').Response} res
 */
const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    // Doble filtro: el documento debe existir Y pertenecer al usuario autenticado
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
 * Elimina un registro de entrenamiento del historial del usuario.
 *
 * @decision Se usa `findOneAndDelete` con filtro compuesto (id + userId) para que
 *           la verificación de propiedad y el borrado sean una operación atómica.
 *           Si se hiciera en dos pasos (buscar, luego borrar), habría una ventana
 *           de tiempo donde otro proceso podría interferir (race condition).
 *
 * @param {import('express').Request} req - Params: id (ObjectId del workout).
 * @param {import('express').Response} res
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
 * Genera métricas de entrenamiento para los dashboards del frontend (Recharts).
 *
 * Devuelve dos conjuntos de datos:
 *  - `muscleDistribution`: total de repeticiones agrupadas por grupo muscular (Pie Chart).
 *  - `volumeProgress`: volumen diario por ejercicio y grupo muscular (Line Chart).
 *
 * @decision Se usan pipelines de agregación de MongoDB en lugar de traer todos los
 *           documentos y procesar en Node.js. MongoDB ejecuta estas operaciones
 *           cerca de los datos, lo que escala mucho mejor con grandes historiales.
 *
 * @decision Fórmula de volumen: Peso × Repeticiones por set, sumado por sesión.
 *           Es el estándar en ciencias del deporte para medir carga de trabajo total.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pipeline A: Distribución muscular para el Pie Chart
    // $unwind descompone el array exercises en documentos individuales,
    // permitiendo agrupar por grupo muscular y sumar reps de todos los sets.
    const muscleDistribution = await Workout.aggregate([
      { $match: { userId } },
      { $unwind: "$exercises" },
      {
        $group: {
          _id: "$exercises.muscleGroup",
          totalReps: {
            $sum: {
              // $reduce itera el array de sets de cada ejercicio y acumula
              // las repeticiones. Es más eficiente que un $unwind adicional.
              $reduce: {
                input: "$exercises.sets",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.reps"] },
              },
            },
          },
        },
      },
    ]);

    // Pipeline B: Progresión de volumen diario para el Line Chart
    // Requiere dos $unwind porque exercises es un array de objetos
    // que a su vez contienen un array de sets (estructura anidada doble).
    const volumeProgress = await Workout.aggregate([
      { $match: { userId } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" }, // Segundo nivel: desglosa cada set individual
      {
        $group: {
          _id: {
            // Agrupamos por fecha (sin hora) para obtener el volumen diario
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
      { $sort: { "_id.fecha": 1 } }, // Orden cronológico para que las líneas del gráfico sean coherentes
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
 * Calcula el volumen total acumulado (Tonnage) de todos los entrenamientos del usuario.
 *
 * Este dato alimenta el sistema de logros: por ejemplo, el logro "Fuerza de un F-16"
 * se desbloquea al superar un umbral de kilogramos totales levantados.
 *
 * @decision Se convierte `userId` a `ObjectId` explícitamente con `new mongoose.Types.ObjectId`
 *           porque en los pipelines de agregación MongoDB no realiza la coerción automática
 *           que sí hace en las queries normales de Mongoose (findOne, find, etc.).
 *
 * @caso_borde Si el usuario no tiene ningún entrenamiento, `result` es un array vacío.
 *             Se normaliza devolviendo `{ totalWeight: 0 }` en lugar de un array vacío,
 *             para que el frontend no tenga que manejar ese caso especial.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getTotalVolume = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Workout.aggregate([
      {
        // En agregaciones, Mongoose no convierte el string a ObjectId automáticamente
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: null, // null agrupa TODOS los documentos en uno solo
          totalVolume: {
            $sum: {
              $multiply: ["$exercises.sets.reps", "$exercises.sets.weight"],
            },
          },
        },
      },
    ]);

    // Si no hay documentos, result es [] y result[0] sería undefined
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
