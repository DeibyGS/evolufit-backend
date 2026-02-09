const { z } = require("zod");
const { MUSCLE_GROUPS, EXERCISE_NAMES } = require("../constants/exerciseList");

/**
 * Esquema de Series (El nivel más bajo)
 */
const setSchema = z.object({
  reps: z.coerce
    .number({
      invalid_type_error: "Las repeticiones deben ser un número",
      required_error: "Las repeticiones son obligatorias",
    })
    .int("Las repeticiones deben ser un número entero")
    .min(1, "Al menos una repetición es necesaria")
    .max(100, "Límite de repeticiones excedido"),

  weight: z.coerce
    .number({
      invalid_type_error: "El peso debe ser un número",
    })
    .min(0, "El peso no puede ser negativo")
    .max(600, "El peso excede el límite permitido")
    .default(0),
});

/**
 * Esquema de Ejercicio (Contiene un array de series)
 */
const exerciseSchema = z.object({
  muscleGroup: z.enum(MUSCLE_GROUPS, {
    invalid_type_error: "Grupo muscular no válido",
    required_error: "El grupo muscular es obligatorio",
  }),

  exerciseName: z.enum(EXERCISE_NAMES, {
    invalid_type_error:
      "El ejercicio seleccionado no existe en nuestra base de datos",
    required_error: "El nombre del ejercicio es obligatorio",
  }),

  sets: z
    .array(setSchema)
    .min(1, "Cada ejercicio debe tener al menos una serie"),
});

/**
 * Esquema Maestro de Workout (El que usaremos en la ruta POST)
 */
const workoutValidatorSchema = z.object({
  routineName: z
    .string()
    .trim()
    .max(50, "El nombre de la rutina es demasiado largo")
    .optional()
    .default("Entrenamiento sin nombre"),

  exercises: z
    .array(exerciseSchema)
    .min(1, "La rutina debe tener al menos un ejercicio"),

  date: z.coerce
    .date({
      invalid_type_error: "La fecha tiene un formato inválido",
    })
    .max(new Date(), "No puedes registrar un entrenamiento con fecha futura")
    .default(() => new Date()),
});

module.exports = { workoutValidatorSchema };
