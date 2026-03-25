/**
 * WORKOUT MODEL - EVOLUTFIT
 * Define la estructura jerárquica para el registro de sesiones de entrenamiento.
 *
 * Se usa un diseño de documentos anidados (subdocumentos) en lugar de colecciones
 * separadas para ejercicios y series porque:
 * - Una sesión siempre se lee y escribe completa (nunca se consulta una serie sola).
 * - Un solo documento en MongoDB equivale a un único viaje a la base de datos,
 *   lo que mejora el rendimiento respecto a múltiples JOINs/lookups.
 * - El tamaño de un workout típico (10-20 series) es manejable dentro del límite de 16 MB de BSON.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * @typedef {object} SetSubdoc
 * @property {number} reps   - Repeticiones de la serie (mínimo 1).
 * @property {number} weight - Peso en kg (0 para ejercicios de peso corporal como dominadas).
 */

/**
 * @typedef {object} ExerciseSubdoc
 * @property {string}       muscleGroup  - Grupo muscular trabajado (validado en validator).
 * @property {string}       exerciseName - Nombre del ejercicio (validado en validator).
 * @property {SetSubdoc[]}  sets         - Series realizadas en este ejercicio.
 */

/**
 * @typedef {object} WorkoutDocument
 * @property {mongoose.Types.ObjectId} userId      - Propietario del registro.
 * @property {string}                  routineName - Nombre descriptivo de la sesión.
 * @property {ExerciseSubdoc[]}        exercises   - Ejercicios realizados en la sesión.
 * @property {Date}                    date        - Fecha de la sesión (puede ser retroactiva).
 */

/**
 * Esquema de Entrenamiento (Workout).
 * Representa una sesión completa compuesta por múltiples ejercicios y series.
 */
const workoutSchema = new Schema(
  {
    /**
     * Vincula la sesión al usuario propietario.
     * Se usa en consultas para filtrar el historial personal: `{ userId: req.user._id }`.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Nombre descriptivo de la sesión (ej: "Día de Empuje", "Full Body").
     * El valor por defecto garantiza que siempre haya un título visible en la UI,
     * incluso si el usuario no especificó ninguno.
     */
    routineName: {
      type: String,
      default: "Entrenamiento sin nombre",
      trim: true,
    },

    /**
     * Lista de ejercicios de la sesión (subdocumentos de primer nivel).
     * Cada ejercicio contiene sus propias series como subdocumentos de segundo nivel.
     */
    exercises: [
      {
        muscleGroup: { type: String, required: true },
        exerciseName: { type: String, required: true },

        /**
         * Series del ejercicio. Es el nivel más granular del modelo.
         * `weight` tiene default 0 para soportar ejercicios de peso corporal
         * (ej: dominadas, fondos) donde no se añade carga externa.
         * El volumen total se calcula como la suma de (reps × weight) en el controlador.
         */
        sets: [
          {
            reps: { type: Number, required: true },
            // Peso en kg; 0 indica ejercicio de peso corporal (sin carga externa)
            weight: { type: Number, default: 0 },
          },
        ],
      },
    ],

    /**
     * Fecha de la sesión de entrenamiento.
     * Admite fechas pasadas para registrar entrenamientos retroactivos.
     * La validación en el validator prohíbe fechas futuras.
     */
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // versionKey: false elimina el campo __v (metadatos internos de Mongoose)
    // timestamps: true genera createdAt/updatedAt para auditoría y posibles gráficas
    versionKey: false,
    timestamps: true,
  },
);

/**
 * Registro del modelo.
 * Mongoose mapeará este schema a la colección 'workouts' en MongoDB.
 */
const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
