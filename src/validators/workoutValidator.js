const { z } = require("zod");
const { MUSCLE_GROUPS, EXERCISE_NAMES } = require("../constants/exerciseList");

/**
 * Esquema de Series (El nivel más bajo)
 */
const setSchema = z.object({
  reps: z.coerce.number().min(1, "Al menos una repetición es necesaria"),
  weight: z.coerce.number().min(0, "El peso no puede ser negativo").default(0),
});

/**
 * Esquema de Ejercicio (Contiene un array de series)
 */
const exerciseSchema = z.object({
  // 2. Usamos el array MUSCLE_GROUPS de las constantes
  muscleGroup: z.enum(MUSCLE_GROUPS, {
    errorMap: () => ({ message: "Grupo muscular no válido" }),
  }),

  // 3. Usamos el array EXERCISE_NAMES para validar el nombre del ejercicio
  exerciseName: z.enum(EXERCISE_NAMES, {
    errorMap: () => ({
      message: "El ejercicio seleccionado no existe en nuestra base de datos",
    }),
  }),

  sets: z
    .array(setSchema)
    .min(1, "Cada ejercicio debe tener al menos una serie"),
});

/**
 * Esquema Maestro de Workout (El que usaremos en la ruta POST)
 */
const workoutValidatorSchema = z.object({
  // El userId no suele validarse aquí si lo sacamos del token (isAuth)
  routineName: z.string().trim().optional().default("Entrenamiento sin nombre"),
  exercises: z
    .array(exerciseSchema)
    .min(1, "La rutina debe tener al menos un ejercicio"),
  date: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
});

module.exports = { workoutValidatorSchema };
