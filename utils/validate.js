/**
 * MIDDLEWARE DE VALIDACIÓN GENÉRICO
 * @param {z.ZodObject} schema - El esquema de Zod que debe cumplir el body
 */
const validate = (schema) => (req, res, next) => {
  // safeParse devuelve un objeto con { success: true/false, data, error }
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Si falla, mapeamos los errores para que el frontend reciba algo legible
    const errorMessages = result.error.errors.map((err) => ({
      campo: err.path[0],
      mensaje: err.message,
    }));

    return res.status(500).json({
      status: "error",
      message: "Validación fallida",
      errors: errorMessages,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
