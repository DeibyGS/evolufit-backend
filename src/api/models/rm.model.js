/**
 * RM RECORD MODEL - EVOLUTFIT
 * Define el esquema para el almacenamiento de marcas personales de fuerza (1RM).
 */

const mongoose = require("mongoose");

/**
 * Esquema para el registro de Repeticiones Máximas estimadas.
 * Almacena tanto los datos de entrada como los resultados de fórmulas de potencia.
 */
const rmSchema = new mongoose.Schema(
  {
    /**
     * Identificador del atleta propietario del récord.
     * Establece una relación con la colección de Usuarios.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Nombre del ejercicio (ej: "Press de Banca", "Sentadilla")
    exerciseName: { type: String, required: true },

    // Categoría muscular para filtrado en el Leaderboard (ej: "Pecho", "Pierna")
    muscleGroup: { type: String, required: true },

    // Carga real utilizada durante la serie de prueba
    weightUsed: { type: Number, required: true },

    // Número de repeticiones logradas con el peso indicado
    repsDone: { type: Number, required: true },

    /** * Resultados de Estimación de 1RM
     */
    // Cálculo mediante la fórmula de Epley: W * (1 + r/30)
    epleyResult: { type: Number, required: true },

    // Cálculo mediante la fórmula de Brzycki: W / (1.0278 - 0.0278 * r)
    // Esta es la métrica principal para el ranking de EvolutFit.
    brzyckiResult: { type: Number, required: true },

    // Fecha manual del registro
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Registro del modelo en Mongoose.
 * Los documentos se almacenarán en la colección 'rmrecords'.
 */
module.exports = mongoose.model("RMRecord", rmSchema);
