const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      // 1. Mapeo manual para tener control total del PATH
      const errorMessages = result.error.errors.map((err) => {
        // Si el path es ["body", "weight"], nos quedamos solo con "weight"
        // Si el path es ["body"], lo dejamos como "body" (fallo general del objeto)
        const cleanPath =
          err.path.length > 1 ? err.path[err.path.length - 1] : err.path[0];

        return {
          path: cleanPath,
          message: err.message,
        };
      });

      console.log("❌ Zod rechazó:", errorMessages);

      return res.status(400).json({
        status: "error",
        errors: errorMessages,
      });
    }

    // 2. Éxito: Sobreescribimos con los datos limpios (importante para z.coerce)
    req.body = result.data.body || req.body;
    req.query = result.data.query || req.query;
    req.params = result.data.params || req.params;

    next();
  } catch (err) {
    console.error("🔥 ERROR EN MIDDLEWARE:", err);
    return res.status(500).json({
      status: "error",
      errors: [{ path: "general", message: "Fallo interno en el validador" }],
    });
  }
};

module.exports = validate;
