const { z } = require("zod");
const { MUSCLE_GROUPS, EXERCISE_NAMES } = require("../constants/exerciseList");

/**
 * VALIDADOR DE RM - EVOLUTFIT
 * Solo valida un levantamiento único para calcular el récord personal.
 */
const rmValidatorSchema = z.object({
  exerciseName: z.enum(EXERCISE_NAMES, {
    errorMap: () => ({
      message: "El ejercicio seleccionado no existe en nuestra base de datos",
    }),
  }),
  muscleGroup: z.enum(MUSCLE_GROUPS, {
    errorMap: () => ({ message: "Grupo muscular no válido" }),
  }),
  weightUsed: z.coerce.number().min(0, "El peso no puede ser negativo"),
  repsDone: z.coerce
    .number()
    .int("Las repeticiones deben ser un número entero")
    .min(1, "Al menos una repetición es necesaria")
    .max(20, "Las fórmulas de RM pierden precisión por encima de 20 reps"),
  date: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
});

module.exports = {
  rmValidatorSchema,
};
