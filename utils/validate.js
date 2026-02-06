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
      // 2. Mapeo ultra-defensivo (Check de cada propiedad)
      const errorMessages = result.error.errors.map((err) => {
        console.log("❌ Detalle error Zod:", err); // Esto saldrá en los logs de Render

        return {
          // Si path no existe o está vacío, ponemos 'general'
          path:
            err.path && err.path.length > 0
              ? err.path[err.path.length - 1]
              : "general",
          message: err.message || "Error de validación",
        };
      });

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
