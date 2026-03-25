/**
 * CONTROLADOR DE 1RM Y LEADERBOARD - EVOLUTFIT
 * Gestión de cálculos de Repetición Máxima (1RM) y del ranking global de atletas.
 */

const RMRecord = require("../models/rm.model");

/**
 * Guarda un nuevo cálculo de 1RM y determina si es récord personal (PR).
 * URL: POST /api/rm
 *
 * @decision Se busca el mejor resultado previo del ejercicio para ese usuario
 *           antes de guardar, y se marca `isPersonalRecord: true` si el nuevo
 *           resultado supera al anterior. El frontend usa este flag para mostrar
 *           la animación de celebración al usuario.
 *
 * @decision Se ordena por `brzyckiResult` descendente y se toma el primero,
 *           en lugar de guardar un campo "mejor resultado" separado. Esto evita
 *           inconsistencias si el usuario borra registros intermedios.
 *
 * @param {import('express').Request} req - Body: exerciseName, brzyckiResult, muscleGroup, etc.
 * @param {import('express').Response} res
 */
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
 * Obtiene el historial paginado de registros 1RM del usuario autenticado.
 * URL: GET /api/rm?page=1&limit=15
 *
 * @decision `Promise.all` ejecuta la consulta paginada y el conteo total en paralelo,
 *           reduciendo la latencia frente a dos queries secuenciales.
 *
 * @param {import('express').Request} req - Query: page (default 1), limit (default 15)
 * @param {import('express').Response} res
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
      hasNextPage: skip + records.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros" });
  }
};

/**
 * Elimina un registro de 1RM del historial del usuario.
 * URL: DELETE /api/rm/:id
 *
 * @decision `findOneAndDelete` con filtro compuesto `{ _id, userId }` verifica
 *           la propiedad y borra en una sola operación atómica. Si el ID
 *           pertenece a otro usuario, no encuentra el documento y no borra nada.
 *
 * @caso_borde Si el registro eliminado era el récord personal del ejercicio,
 *             el siguiente registro más alto pasa a ser el nuevo mejor, pero
 *             su campo `isPersonalRecord` no se actualiza automáticamente.
 *             Aceptable para el alcance del TFG.
 *
 * @param {import('express').Request} req - Params: id (ObjectId del registro)
 * @param {import('express').Response} res
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
 * Genera el ranking global de 1RM paginado (Leaderboard).
 * URL: GET /api/rm/leaderboard?page=1&limit=10
 *
 * @decision El pipeline agrupa por `exerciseName` y toma el record más alto de cada
 *           ejercicio para mostrarlo en el leaderboard. Para ello primero ordena por
 *           `brzyckiResult` descendente y luego usa `$first` en el `$group`, que
 *           selecciona el primer documento de cada grupo (el de mayor peso).
 *
 * @decision `Promise.all` ejecuta el pipeline de récords y el conteo de ejercicios
 *           únicos en paralelo para calcular la paginación sin una query extra secuencial.
 *
 * @decision Se usa `$lookup` con sub-pipeline `$project` para traer solo los datos
 *           necesarios del autor (name, lastname, avatar), sin exponer campos sensibles.
 *
 * @param {import('express').Request} req - Query: page (default 1), limit (default 10)
 * @param {import('express').Response} res
 */
const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Pipeline para los registros
    const recordsPipeline = [
      { $sort: { brzyckiResult: -1 } },
      {
        $group: {
          _id: "$exerciseName",
          maxWeight: { $first: "$brzyckiResult" },
          userId: { $first: "$userId" },
          muscleGroup: { $first: "$muscleGroup" },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { maxWeight: -1 } },
      { $skip: skip },
      { $limit: limit },
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
    ];

    // 2. Ejecutamos el pipeline y el conteo de grupos únicos en paralelo
    const [leaders, totalGroups] = await Promise.all([
      RMRecord.aggregate(recordsPipeline),
      RMRecord.aggregate([
        { $group: { _id: "$exerciseName" } },
        { $count: "total" },
      ]),
    ]);

    const total = totalGroups[0]?.total || 0;

    res.status(200).json({
      records: leaders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
      hasNextPage: skip + leaders.length < total,
    });
  } catch (error) {
    console.error("🔥 Error en getLeaderboard:", error);
    res.status(500).json({ message: "Error al cargar el ranking" });
  }
};

module.exports = { saveRM, getMyRMs, deleteRM, getLeaderboard };
