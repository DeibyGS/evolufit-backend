/**
 * CONTROLADOR DE REGISTROS DE SALUD - EVOLUTFIT
 * Gestiona el historial de métricas de salud calculadas por el usuario (IMC, TDEE, Grasa Corporal).
 * Cada registro es un snapshot de los valores en el momento del cálculo.
 */

const Health = require("../models/health.model");

/**
 * Persiste un nuevo cálculo de salud vinculado al usuario autenticado.
 *
 * @decision Los datos llegan ya validados y limpios por el middleware Zod.
 *           Por eso se verifica que el body no esté vacío como segunda línea de defensa,
 *           por si el middleware no se ejecutó correctamente (mala configuración de ruta).
 *
 * @decision El `userId` se fuerza desde el token (req.user._id) y no desde el body,
 *           igual que en workout y rm, para evitar que un usuario registre datos ajenos.
 *
 * @param {import('express').Request} req - Body: datos de salud validados por Zod.
 * @param {import('express').Response} res
 */
const saveHealthRecord = async (req, res) => {
  try {
    const healthData = req.body;

    // Guarda defensiva: si el body llegó vacío (p.ej. el middleware de validación falló
    // silenciosamente), rechazamos aquí en lugar de guardar un documento vacío en BD.
    if (!healthData || Object.keys(healthData).length === 0) {
      return res.status(400).json({
        message: "No se recibieron datos válidos después de la validación",
      });
    }

    const record = new Health({
      ...healthData,
      userId: req.user._id,
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error("❌ Error en saveHealthRecord:", error);
    res.status(400).json({ message: error.message || "Error al guardar" });
  }
};

/**
 * Recupera el historial completo de registros de salud del usuario autenticado.
 *
 * @decision Se ordena por `createdAt` descendente para que el registro más reciente
 *           aparezca primero, facilitando al frontend mostrar el último cálculo
 *           sin tener que invertir el array.
 *
 * @caso_borde Si el usuario no tiene registros, se devuelve un array vacío `[]`
 *             en lugar de 404. Esto permite que el frontend use `.map()` o `.length`
 *             directamente sin comprobar si la respuesta es null o undefined.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllHealthRecords = async (req, res) => {
  try {
    const history = await Health.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    // `history` nunca es null con Mongoose (devuelve [] si no hay documentos),
    // pero se usa `|| []` como salvaguarda explícita para lectura del código.
    res.status(200).json(history || []);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial" });
  }
};

/**
 * Elimina un registro de salud específico del historial del usuario.
 *
 * @decision Se usa `findOneAndDelete` con filtro compuesto `{ _id, userId }` para
 *           verificar la propiedad y borrar en una sola operación atómica.
 *           Esto evita el patrón inseguro de buscar primero y borrar después,
 *           que dejaría una ventana donde otro proceso podría interferir.
 *
 * @param {import('express').Request} req - Params: id (ObjectId del registro).
 * @param {import('express').Response} res
 */
const deleteHealthRecord = async (req, res) => {
  try {
    // El filtro doble garantiza que solo el propietario puede borrar su registro.
    // Si un usuario envía el ID de un registro ajeno, el findOneAndDelete no encuentra
    // nada y devuelve null, respondiendo con 404 sin revelar que el registro existe.
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
