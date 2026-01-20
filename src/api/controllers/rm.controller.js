/**
 * RM & LEADERBOARD CONTROLLER - EVOLUTFIT
 * Gestión de cálculos de 1RM (Repetición Máxima) y Rankings globales.
 */

const RMRecord = require("../models/rm.model");

/**
 * Almacena un nuevo cálculo de RM.
 * Utiliza el spread operator para incluir los datos del cálculo y el ID del usuario autenticado.
 */
const saveRM = async (req, res) => {
  try {
    // 1. Instancia del registro vinculando el userId del token
    const newRecord = new RMRecord({ ...req.body, userId: req.user._id });

    // 2. Persistencia en la colección 'rmrecords'
    await newRecord.save();

    // 3. Respuesta exitosa (201 Created)
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: "Error al guardar el RM" });
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
