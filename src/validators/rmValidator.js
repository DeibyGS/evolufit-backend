const { z } = require("zod");
const { MUSCLE_GROUPS, EXERCISE_NAMES } = require("../constants/exerciseList");

/**
 * VALIDADOR DE RM - EVOLUTFIT
 * Ajustado para recibir weightUsed, repsDone y resultados de fórmulas.
 */
const rmValidatorSchema = z.object({
  body: z.object({
    exerciseName: z.enum(EXERCISE_NAMES, {
      invalid_type_error:
        "El ejercicio seleccionado no existe en nuestra base de datos",
      required_error: "El nombre del ejercicio es obligatorio",
    }),

    muscleGroup: z.enum(MUSCLE_GROUPS, {
      invalid_type_error: "Grupo muscular no válido",
      required_error: "El grupo muscular es obligatorio",
    }),

    weightUsed: z.coerce
      .number({
        invalid_type_error: "El peso debe ser un número",
        required_error: "El peso es obligatorio",
      })
      .min(0, "El peso no puede ser negativo")
      .max(600, "El peso excede el límite permitido (600 kg)"),

    repsDone: z.coerce
      .number({
        invalid_type_error: "Las repeticiones deben ser un número",
        required_error: "Las repeticiones son obligatorias",
      })
      .int("Las repeticiones deben ser un número entero")
      .min(1, "Al menos una repetición es necesaria")
      .max(20, "Las fórmulas de RM pierden precisión por encima de 20 reps"),

    // Campos de resultados que envías desde el frontend
    epleyResult: z.coerce
      .number({
        invalid_type_error: "El resultado de Epley debe ser un número",
      })
      .optional(),

    brzyckiResult: z.coerce
      .number({
        invalid_type_error: "El resultado de Brzycki debe ser un número",
      })
      .optional(),

    date: z.coerce
      .date({
        invalid_type_error: "La fecha tiene un formato inválido",
      })
      .max(new Date(), "No puedes registrar un récord con fecha futura")
      .default(() => new Date()),
  }),
});

module.exports = {
  rmValidatorSchema,
};
