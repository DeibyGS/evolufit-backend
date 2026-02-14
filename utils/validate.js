const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      // Usamos .issues para tener acceso total a la jerarquía del error
      const errorMessages = result.error.issues.map((issue) => {
        return {
          // Si el path es ['body', 'weight'], tomamos solo 'weight'
          // Si el path es solo ['body'], lo dejamos como 'body'
          path:
            issue.path.length > 1
              ? issue.path[issue.path.length - 1]
              : issue.path[0],
          message: issue.message,
        };
      });

      console.log("📤 Enviando al front:", errorMessages);

      return res.status(400).json({
        status: "error",
        errors: errorMessages,
      });
    }

    // Éxito: Limpieza de datos (Zod coerce convierte strings a numbers aquí)
    req.body = result.data.body || req.body;
    req.query = result.data.query || req.query;
    req.params = result.data.params || req.params;
    next();
  } catch (err) {
    console.error("🔥 ERROR CRÍTICO:", err);
    return res.status(500).json({
      status: "error",
      errors: [{ path: "general", message: "Fallo interno del validador" }],
    });
  }
};

module.exports = validate;
