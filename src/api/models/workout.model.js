/**
 * WORKOUT MODEL - EVOLUTFIT
 * Define la estructura jerárquica para el registro de sesiones de entrenamiento.
 * Utiliza un diseño de documentos anidados para optimizar la lectura de rutinas completas.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Esquema de Entrenamiento (Workout).
 * Representa una sesión completa, compuesta por múltiples ejercicios y series.
 */
const workoutSchema = new Schema(
  {
    /**
     * Relación con el Atleta.
     * Vincula la sesión al usuario propietario para la gestión del historial personal.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Nombre descriptivo de la sesión (ej: "Día de Empuje", "Full Body").
     * Se aplica un valor por defecto para garantizar que siempre haya un título en la UI.
     */
    routineName: {
      type: String,
      default: "Entrenamiento sin nombre",
      trim: true,
    },

    /**
     * Colección anidada de Ejercicios.
     * Estructura de primer nivel: Define qué se entrenó y a qué grupo muscular pertenece.
     */
    exercises: [
      {
        muscleGroup: { type: String, required: true },
        exerciseName: { type: String, required: true },

        /**
         * Colección anidada de Series (Sets).
         * Estructura de segundo nivel: Define la carga de trabajo específica.
         * Es la base para el cálculo del volumen total (reps * weight).
         */
        sets: [
          {
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }, // Peso en kg, default 0 para ejercicios corporales
          },
        ],
      },
    ],

    /**
     * Fecha de la sesión.
     * Permite al usuario retroceder en el tiempo o registrar entrenamientos pasados.
     */
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // versionKey: false: Limpia el objeto JSON de metadatos internos de Mongoose (__v).
    // timestamps: true: Genera createdAt/updatedAt para auditoría y gráficas.
    versionKey: false,
    timestamps: true,
  },
);

/**
 * Registro del modelo.
 * Se mapeará a la colección 'workouts' en MongoDB.
 */
const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
