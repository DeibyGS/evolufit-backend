/**
 * MIDDLEWARE DE VALIDACIÓN BLINDADO
 * Rol: Senior SRE / Debugger
 */
const validate = (schema) => (req, res, next) => {
  try {
    // 1. Verificación de existencia del Body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        errors: [
          {
            path: "general",
            message: "No se recibieron datos en la solicitud",
          },
        ],
      });
    }

    const result = schema.safeParse(req.body);

    // 2. Manejo de error de validación
    if (!result.success) {
      // Verificación de seguridad: ¿Existe result.error y result.error.errors?
      // Esto evita el "Cannot read properties of undefined (reading 'map')"
      if (!result.error || !Array.isArray(result.error.errors)) {
        console.error(
          "❌ Error crítico en Zod: Estructura de error inesperada",
          result,
        );
        return res.status(500).json({
          status: "error",
          errors: [
            {
              path: "general",
              message: "Error interno al procesar la validación",
            },
          ],
        });
      }

      // Mapeo ultra-seguro
      const errorMessages = result.error.errors.map((err) => ({
        // Tomamos el último elemento del path o "general"
        path:
          err.path && err.path.length > 0
            ? err.path[err.path.length - 1]
            : "general",
        message: err.message || "Dato inválido",
      }));

      console.log(
        "⚠️ FALLO DE VALIDACIÓN -> ENVIANDO AL FRONT:",
        errorMessages,
      );

      return res.status(400).json({
        status: "error",
        errors: errorMessages,
      });
    }

    // 3. Éxito: Reemplazamos el body con los datos limpios de Zod (importante para coercion)
    req.body = result.data;
    next();
  } catch (error) {
    // 4. Captura de errores inesperados para que el servidor no se caiga
    console.error("🔥 ERROR CATASTRÓFICO EN EL MIDDLEWARE:", error);
    return res.status(500).json({
      status: "error",
      errors: [{ path: "server", message: "Error inesperado en el servidor" }],
    });
  }
};

module.exports = validate;
