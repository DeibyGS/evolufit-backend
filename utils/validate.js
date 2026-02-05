const { z } = require("zod");

/**
 * MIDDLEWARE DE VALIDACIÓN GENÉRICO - EVOLUTFIT
 * Protege contra errores de 'undefined' y asegura respuestas JSON.
 */
const validate = (schema) => (req, res, next) => {
  try {
    // 1. Verificación de seguridad: ¿Existe el esquema?
    if (!schema || typeof schema.safeParse !== "function") {
      throw new Error("Esquema de validación no válido o no proporcionado");
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 2. Extracción segura de errores
      // Usamos el encadenamiento opcional (?.) para evitar el error de 'reading map'
      const errorMessages =
        result.error?.errors?.map((err) => ({
          campo: err.path[0] || "desconocido",
          mensaje: err.message,
        })) || [];

      return res.status(400).json({
        status: "error",
        message: "Validación fallida",
        errors: errorMessages,
      });
    }

    // 3. Sanitización: Solo pasan al controlador los datos definidos en el esquema
    req.body = result.data;
    next();
  } catch (error) {
    // 4. Captura de errores catastróficos (Evita el 500 HTML)
    console.error(
      "❌ Error Crítico en Middleware de Validación:",
      error.message,
    );
    return res.status(500).json({
      status: "error",
      message: "Error interno en el proceso de validación",
      details: error.message,
    });
  }
};

module.exports = validate;
