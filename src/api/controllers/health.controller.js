/**
 * HEALTH RECORDS CONTROLLER - EVOLUTFIT
 * Gestión del historial de métricas de salud (IMC, TDEE, Grasa Corporal).
 */

const Health = require("../models/health.model");

/**
 * Persistencia de un nuevo cálculo de salud.
 * Vincula automáticamente el registro al usuario autenticado.
 */
const saveHealthRecord = async (req, res) => {
  try {
    // 1. Creación del registro extendiendo el cuerpo de la petición con el ID del usuario (inyectado por el middleware de auth)
    const record = new Health({ ...req.body, userId: req.user._id });

    // 2. Guardado en la colección 'healthrecords'
    await record.save();

    // 3. Respuesta con el objeto creado (HTTP 201 Created)
    res.status(201).json(record);
  } catch (error) {
    // Error de validación o fallo en la base de datos
    res.status(400).json({ message: "Error al guardar" });
  }
};

/**
 * Recuperación del historial completo del usuario.
 * Optimizado para mostrar primero los registros más recientes.
 */
const getAllHealthRecords = async (req, res) => {
  try {
    // 1. Búsqueda de todos los documentos que pertenezcan al usuario autenticado
    // .sort({ createdAt: -1 }) asegura que el historial aparezca de más reciente a más antiguo
    const history = await Health.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    // 2. Integridad de la respuesta: Si no hay registros, se retorna un Array vacío []
    // Esto evita errores de .map() o .length en el Frontend.
    res.status(200).json(history || []);
  } catch (error) {
    // Error de conexión o consulta
    res.status(500).json({ message: "Error al obtener el historial" });
  }
};

/**
 * Eliminación de un registro específico del historial.
 * Incluye doble validación de seguridad (ID del registro + ID del propietario).
 */
const deleteHealthRecord = async (req, res) => {
  try {
    // 1. Localización y borrado atómico
    // Crucial: Se valida que el registro pertenezca al usuario para evitar que un usuario borre datos de otro
    const deleteRecord = await Health.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleteRecord) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.status(200).json({ message: "Registro eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

module.exports = {
  saveHealthRecord,
  getAllHealthRecords,
  deleteHealthRecord,
};
