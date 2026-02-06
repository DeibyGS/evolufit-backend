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
      // 1. Log profundo para ver qué está pasando
      console.log("❌ ZOD ERROR DETECTADO");

      // 2. Usamos flatten() para obtener un formato más amigable
      // fieldErrors será algo como: { age: ["Debes tener..."], weight: ["Mínimo 20kg"] }
      const formattedErrors = result.error.flatten().fieldErrors;

      const errorMessages = [];

      // 3. Convertimos el objeto de fieldErrors en nuestro array estándar
      for (const field in formattedErrors) {
        errorMessages.push({
          path: field,
          message: formattedErrors[field][0], // Tomamos el primer mensaje de error del campo
        });
      }

      // 4. Si por algo no hay errores de campo, buscamos errores de formulario (formErrors)
      if (errorMessages.length === 0) {
        result.error.errors.forEach((err) => {
          errorMessages.push({
            path:
              err.path.length > 0 ? err.path[err.path.length - 1] : "general",
            message: err.message,
          });
        });
      }

      console.log("📤 Enviando al front:", errorMessages);

      return res.status(400).json({
        status: "error",
        errors:
          errorMessages.length > 0
            ? errorMessages
            : [{ path: "general", message: "Error de validación" }],
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
