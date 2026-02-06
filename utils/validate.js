const validate = (schema) => (req, res, next) => {
  try {
    // 1. Log de entrada para ver qué llega desde el Front
    console.log("📥 Datos recibidos en el Body:", req.body);

    if (!req.body) {
      return res.status(400).json({
        status: "error",
        errors: [{ path: "general", message: "Cuerpo de petición vacío" }],
      });
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Log para ver qué tiene exactamente el objeto de error si falla el mapeo
      console.log("❌ ZOD RAW ERROR:", JSON.stringify(result.error));

      // Usamos encadenamiento opcional (?.) y un array vacío por defecto ([])
      const errorList = result.error?.errors || [];

      if (errorList.length === 0) {
        return res.status(400).json({
          status: "error",
          errors: [
            { path: "general", message: "Error de validación desconocido" },
          ],
        });
      }

      const errorMessages = errorList.map((err) => ({
        path:
          err.path && err.path.length > 0
            ? err.path[err.path.length - 1]
            : "general",
        message: err.message || "Dato inválido",
      }));

      return res.status(400).json({
        status: "error",
        errors: errorMessages,
      });
    }

    // 3. Éxito: Limpieza de datos
    req.body = result.data;
    next();
  } catch (err) {
    // 4. Captura el error real y muéstralo en la consola de Render
    console.error("🔥 ERROR REAL DETECTADO:", err.message);
    console.error("📋 STACK TRACE:", err.stack);

    return res.status(500).json({
      status: "error",
      errors: [{ path: "general", message: `Fallo crítico: ${err.message}` }],
    });
  }
};

module.exports = validate;
