/**
 * VALIDADOR DE SALUD - EVOLUTFIT
 *
 * Valida los datos biométricos del usuario para calcular IMC, TMB y TDEE.
 *
 * @decision Los campos `imc`, `tmb` y `tdee` son opcionales porque los cálculos
 *           se realizan en el frontend y se envían al backend solo para persistirlos.
 *           El backend no los recalcula; confía en los valores del cliente.
 *
 * @decision El campo `activity` acepta el factor de actividad de la fórmula Harris-Benedict:
 *           - 1.2  → Sedentario (sin ejercicio)
 *           - 1.375 → Actividad ligera (1-3 días/semana)
 *           - 1.55  → Actividad moderada (3-5 días/semana)
 *           - 1.725 → Actividad intensa (6-7 días/semana)
 *           - 1.9   → Actividad muy intensa (atletas, doble sesión)
 *           El max de 2.5 existe como límite defensivo, no como valor estándar.
 */

const { z } = require("zod");

const healthValidatorSchema = z.object({
  body: z.object({
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
      .min(14, "Debes tener al menos 14 años")
      .max(120, "La edad máxima es 120 años"),

    gender: z.enum(["hombre", "mujer"], {
      invalid_type_error: "Selecciona un género válido",
      required_error: "El género es obligatorio",
    }),

    activity: z.coerce
      .number({ required_error: "El nivel de actividad es obligatorio" })
      .min(1.2, "Mínimo 1.2")
      .max(2.5, "Máximo 2.5"),

    // Campos calculados en el frontend y persistidos tal cual en el backend
    imc: z.coerce.number().optional(),
    tmb: z.coerce.number().optional(),
    tdee: z.coerce.number().optional(),
  }),
});

module.exports = {
  healthValidatorSchema,
};
