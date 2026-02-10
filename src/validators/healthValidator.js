const { z } = require("zod");

const healthValidatorSchema = z
  .object({
    weight: z.coerce
      .number({
        invalid_type_error: "El peso debe ser un número",
        required_error: "El peso es obligatorio",
      })
      .min(20, "El peso debe ser realista (mínimo 20kg)")
      .max(300, "El peso excede el límite permitido"),

    height: z.coerce
      .number({
        invalid_type_error: "La altura debe ser un número",
        required_error: "La altura es obligatoria",
      })
      .int("La altura debe ser un número entero (cm)")
      .min(100, "La altura mínima es 100 cm")
      .max(250, "La altura máxima es 250 cm"),

    age: z.coerce
      .number({ required_error: "La edad es obligatoria" })
      .int("La edad debe ser un número entero")
      .min(14, "Debes tener al menos 14 años"),

    gender: z.enum(["hombre", "mujer"], {
      invalid_type_error: "Selecciona un género válido",
      required_error: "El género es obligatorio",
    }),

    activity: z.coerce
      .number({ required_error: "El nivel de actividad es obligatorio" })
      .min(1.2, "Mínimo 1.2")
      .max(2.5, "Máximo 2.5"),

    // Campos calculados
    imc: z.coerce.number().optional(),
    tmb: z.coerce.number().optional(),
    tdee: z.coerce.number().optional(),
  })
  .strict(); // .strict() asegura que no se permitan campos extraños
module.exports = {
  healthValidatorSchema,
};
