const { z } = require("zod");

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
  muscleGroup: z.string().min(1, "El grupo muscular es obligatorio"),
  exerciseName: z.string().min(1, "El nombre del ejercicio es obligatorio"),
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
