/**
 * RM & LEADERBOARD CONTROLLER - EVOLUTFIT
 * Gestión de cálculos de 1RM (Repetición Máxima) y Rankings globales.
 */

const { rm } = require("fs");
const RMRecord = require("../models/rm.model");

/**
 * Almacena un nuevo cálculo de RM.
 * Utiliza el spread operator para incluir los datos del cálculo y el ID del usuario autenticado.
 */
const RMRecord = require("../models/RMRecord");

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
      isPersonalRecord: isNewRecord, // Opcional: guardar esto ayuda a analíticas rápidas
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
    // Filtrado estricto por userId para garantizar privacidad
    const records = await RMRecord.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(records);
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
  try {
    // Agregación avanzada para optimizar la carga de datos en el servidor
    const leaders = await RMRecord.aggregate([
      // 1. Ordenar todos los registros por el resultado de la fórmula de Brzycki
      { $sort: { brzyckiResult: -1 } },

      // 2. Agrupar para obtener solo el récord más alto de cada ejercicio distinto
      {
        $group: {
          _id: "$exerciseName", // Identificador de grupo: el nombre del ejercicio
          maxWeight: { $first: "$brzyckiResult" }, // El valor más alto tras el sort previo
          userName: { $first: "$userId" },
          muscleGroup: { $first: "$muscleGroup" },
          date: { $first: "$createdAt" },
        },
      },

      // 3. Enriquecer los datos (Join) con la colección de usuarios
      {
        $lookup: {
          from: "users", // Colección de origen
          localField: "userName", // Campo en RMRecord
          foreignField: "_id", // Campo en Users
          as: "user", // Nombre del array resultante
        },
      },

      // 4. Transformar el array 'user' en un objeto directo
      { $unwind: "$user" },
    ]);

    // Respuesta con el ranking procesado
    res.status(200).json(leaders);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar el ranking" });
  }
};

module.exports = { saveRM, getMyRMs, deleteRM, getLeaderboard };
