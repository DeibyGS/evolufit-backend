const validate = (schema) => (req, res, next) => {
  console.log("BODY QUE LLEGA AL VALIDATOR:", req.body);
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Si el array sale vacío, es porque 'err.path[0]' falló.
    // Vamos a asegurar que siempre devuelva algo.
    const errorMessages = result.error.errors.map((err) => {
      return {
        // Si path[0] no existe, buscamos en el resto del array o ponemos 'general'
        campo:
          err.path.length > 0 ? err.path[err.path.length - 1] : "formulario",
        mensaje: err.message,
      };
    });

    console.log("Errores detectados por Zod:", errorMessages); // <--- MIRA ESTO EN TU TERMINAL

    return res.status(400).json({
      status: "error",
      message: "Validación fallida",
      errors: errorMessages,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
