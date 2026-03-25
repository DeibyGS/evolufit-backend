/**
 * VALIDADOR DE ENTRENAMIENTOS - EVOLUTFIT
 *
 * Define los esquemas Zod para validar el body de las rutas de workout
 * antes de que lleguen al controlador.
 *
 * Estructura jerárquica (refleja el modelo de MongoDB):
 *   workoutValidatorSchema
 *     └── body
 *           ├── routineName
 *           ├── exercises[]  (exerciseSchema)
 *           │     ├── muscleGroup
 *           │     ├── exerciseName
 *           │     └── sets[]  (setSchema)
 *           │           ├── reps
 *           │           └── weight
 *           └── date
 *
 * @decision Se usa `z.coerce.number()` en lugar de `z.number()` para los campos
 *           numéricos porque el body HTTP llega como strings si viene de un formulario.
 *           `coerce` convierte automáticamente "10" → 10 antes de validar.
 *
 * @decision Los nombres de ejercicios y grupos musculares se validan con `z.enum`
 *           contra la lista centralizada en `exerciseList.js`, garantizando que
 *           solo se guardan valores conocidos en la base de datos.
 */

const { z } = require("zod");
const { MUSCLE_GROUPS, EXERCISE_NAMES } = require("../constants/exerciseList");

/**
 * Esquema de una serie individual (nivel más granular del entrenamiento).
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
 * Esquema de un ejercicio (contiene nombre, grupo muscular y sus series).
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
 * Esquema raíz que envuelve el body completo del POST /api/workouts.
 * El envoltorio `{ body: z.object({...}) }` permite que el middleware `validate()`
 * aplique la validación directamente sobre `req.body`.
 */
const workoutValidatorSchema = z.object({
  body: z.object({
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
  }),
});

module.exports = { workoutValidatorSchema };
