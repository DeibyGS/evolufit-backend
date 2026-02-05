/**
 * MIDDLEWARE DE VALIDACIÓN GENÉRICO - EVOLUTFIT
 */
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Usamos ?. y || [] para asegurar que siempre haya un array sobre el cual hacer .map()
      const errorMessages = (result.error?.errors || []).map((err) => ({
        campo: err.path[err.path.length - 1], // Ej: "age"
        mensaje: err.message, // Ej: "Debes tener al menos 15 años..."
      }));

      return res.status(400).json({
        status: "error",
        message: "Validación fallida",
        errors: errorMessages,
      });
    }

    req.body = result.data;
    next();
  } catch (error) {
    console.error("Error en validate middleware:", error);
    res.status(500).json({ message: "Error interno en la validación" });
  }
};

module.exports = validate;
