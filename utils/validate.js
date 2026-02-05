const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Mapeo ultra-seguro
    const errorMessages = result.error.errors.map((err) => ({
      // Usamos el nombre del campo (ej: "age")
      path: err.path[err.path.length - 1] || "general",
      // Usamos el mensaje de Zod
      message: err.message,
    }));

    console.log("ENVIANDO AL FRONT:", errorMessages);

    return res.status(400).json({
      status: "error",
      errors: errorMessages,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
