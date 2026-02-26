/**
 * RM & LEADERBOARD CONTROLLER - EVOLUTFIT
 * Gestión de cálculos de 1RM (Repetición Máxima) y Rankings globales.
 */
/**
 * Almacena un nuevo cálculo de RM.
 * Utiliza el spread operator para incluir los datos del cálculo y el ID del usuario autenticado.
 */
const RMRecord = require("../models/rm.model");

const saveRM = async (req, res) => {
  try {
    const { exerciseName, brzyckiResult } = req.body;
    const userId = req.user._id;

    // 1. Buscamos el mejor RM previo de este ejercicio para ESTE usuario
    // Ordenamos descendente por brzyckiResult para obtener el valor más alto
    const previousBest = await RMRecord.findOne({
      userId,
      exerciseName,
    }).sort({ brzyckiResult: -1 });

    // 2. Lógica de Récord Personal (PR)
    // Es récord si no hay registros previos O si el actual supera al anterior
    const isNewRecord =
      !previousBest || brzyckiResult > previousBest.brzyckiResult;

    // 3. Instanciamos con los datos del body + userId + flag de récord
    const newRecord = new RMRecord({
      ...req.body,
      userId,
      isPersonalRecord: isNewRecord,
    });

    // 4. Guardado en BD
    await newRecord.save();

    // 5. Respuesta enriquecida
    // Enviamos el registro y el flag 'isNewRecord' para que el Front sepa si mostrar fuego 🔥
    res.status(201).json({
      ...newRecord.toObject(),
      isNewRecord,
    });
  } catch (error) {
    // Debugging: Siempre loguea el error real en consola para diagnosticar en Render/Vercel
    console.error("🔥 Error en saveRM:", error);
    res.status(500).json({ message: "Error al guardar el récord" });
  }
};

/**
 * Obtiene el historial personal de marcas del usuario.
 * Ordenado cronológicamente para visualizar la progresión de fuerza.
 */
const getMyRMs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Ejecutamos ambas consultas en paralelo para ganar velocidad
    const [records, total] = await Promise.all([
      RMRecord.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RMRecord.countDocuments({ userId: req.user._id }), // Cuenta el total de marcas
    ]);

    res.status(200).json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
      hasNextPage: skip + records.length < total, // Útil para el front
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros" });
  }
};

/**
 * Elimina un registro de RM específico.
 * Verifica la propiedad del registro antes de ejecutar la acción.
 */
const deleteRM = async (req, res) => {
  try {
    // Buscamos por ID de registro Y ID de usuario (Seguridad)
    await RMRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    res.status(200).json({ message: "Registro eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

/**
 * Genera el Ranking Global (Leaderboard).
 * Utiliza un pipeline de agregación para obtener los récords más altos por ejercicio.
 */
const getLeaderboard = async (req, res) => {
  // 1. Extraemos parámetros de la query con valores por defecto
  const { page = 1, limit = 15 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // 2. Definimos el pipeline de agregación siguiendo tu estilo
    const leaders = await RMRecord.aggregate([
      // Ordenamos primero para que el $group tome el mayor valor
      { $sort: { brzyckiResult: -1 } },

      // Agrupamos por ejercicio para obtener el récord más alto
      {
        $group: {
          _id: "$exerciseName",
          maxWeight: { $first: "$brzyckiResult" },
          userId: { $first: "$userId" },
          muscleGroup: { $first: "$muscleGroup" },
          date: { $first: "$createdAt" },
        },
      },

      // Volvemos a ordenar el ranking final por peso (del más fuerte al menos)
      { $sort: { maxWeight: -1 } },

      // --- PAGINACIÓN (Igual que en tus Social Posts) ---
      { $skip: skip },
      { $limit: parseInt(limit) },

      // Lookup para traer datos del autor del récord
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, lastname: 1, avatar: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.status(200).json(leaders);
  } catch (error) {
    console.error("🔥 Error en getLeaderboard:", error);
    res.status(500).json({ message: "Error al cargar el ranking" });
  }
};

module.exports = { saveRM, getMyRMs, deleteRM, getLeaderboard };
