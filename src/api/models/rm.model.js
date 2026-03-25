/**
 * MODELO DE RÉCORDS 1RM - EVOLUTFIT
 * Define el esquema para el almacenamiento de marcas personales de fuerza (1RM).
 *
 * El 1RM (Una Repetición Máxima) es el peso máximo que un atleta puede levantar
 * una sola vez en un ejercicio. Se estima mediante fórmulas porque realizar
 * la prueba real entraña riesgo de lesión.
 *
 * Decisiones de diseño relevantes:
 * - Se almacenan los resultados de dos fórmulas distintas (`epleyResult` y `brzyckiResult`)
 *   porque cada una tiene mayor precisión en rangos de repeticiones diferentes.
 *   Brzycki es más precisa con pocas reps (1-6); Epley con rangos medios (6-10).
 * - `brzyckiResult` es la métrica usada para el Leaderboard porque ofrece mayor
 *   consistencia en comparativas entre usuarios.
 * - Los cálculos se realizan en el frontend y se envían al backend para persistir,
 *   evitando recalcular en cada consulta al leaderboard.
 * - `date` admite fecha manual para permitir registrar récords históricos pasados.
 */

const mongoose = require("mongoose");

/**
 * @typedef {object} RMRecordDocument
 * @property {mongoose.Types.ObjectId} userId   - Atleta propietario del récord.
 * @property {string}  exerciseName             - Nombre del ejercicio (validado contra lista cerrada).
 * @property {string}  muscleGroup              - Grupo muscular; permite filtrar el leaderboard por categoría.
 * @property {number}  weightUsed               - Peso real levantado durante la prueba (kg).
 * @property {number}  repsDone                 - Repeticiones completadas; las fórmulas pierden precisión >15 reps.
 * @property {number}  epleyResult              - 1RM estimado por Epley: W × (1 + reps/30).
 * @property {number}  brzyckiResult            - 1RM estimado por Brzycki: W / (1.0278 − 0.0278 × reps). Métrica del ranking.
 * @property {Date}    date                     - Fecha del registro (puede ser retroactiva).
 */
const rmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Nombre del ejercicio (ej: "Press de Banca", "Sentadilla")
    exerciseName: { type: String, required: true },

    // Categoría muscular para filtrado en el Leaderboard (ej: "Pecho", "Pierna")
    muscleGroup: { type: String, required: true },

    // Carga real utilizada durante la serie de prueba (kg)
    weightUsed: { type: Number, required: true },

    // Repeticiones completadas con ese peso (las fórmulas son precisas entre 1-15 reps)
    repsDone: { type: Number, required: true },

    // Estimación de 1RM según fórmula de Epley: W × (1 + reps/30)
    epleyResult: { type: Number, required: true },

    // Estimación de 1RM según fórmula de Brzycki: W / (1.0278 − 0.0278 × reps)
    // Es la métrica principal para el ranking de EvolutFit por su mayor precisión en rangos bajos
    brzyckiResult: { type: Number, required: true },

    // Fecha del registro; permite retroactividad para documentar marcas históricas
    date: { type: Date, default: Date.now },
  },
  {
    // timestamps genera createdAt/updatedAt para auditoría interna
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Registro del modelo en Mongoose.
 * Los documentos se almacenarán en la colección 'rmrecords'.
 */
const RMRecord = mongoose.model("RMRecord", rmSchema);

module.exports = RMRecord;
