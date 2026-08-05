const mongoose = require("mongoose");

/**
 * HEALTH RECORD MODEL - EVOLUTFIT
 * Almacena métricas biométricas del usuario junto con los resultados calculados.
 *
 * Decisiones de diseño relevantes:
 * - Los campos `imc`, `tmb` y `tdee` se persisten como campos calculados porque:
 *   a) Evitan recalcular en cada consulta (rendimiento).
 *   b) Permiten mostrar el histórico aunque los datos de entrada cambien en el futuro.
 * - `activity` es un multiplicador numérico (ej: 1.2 = sedentario, 1.55 = moderado)
 *   en lugar de un enum de texto para simplificar el cálculo de TDEE en el controlador.
 * - `gender` usa enum cerrado porque las fórmulas de TMB (Harris-Benedict / Mifflin-St Jeor)
 *   tienen coeficientes distintos por género biológico.
 */

/**
 * @typedef {object} HealthDocument
 * @property {mongoose.Types.ObjectId} userId   - Referencia al usuario propietario del registro.
 * @property {number} weight                     - Peso en kilogramos.
 * @property {number} height                     - Altura en centímetros (entero).
 * @property {number} age                        - Edad en años en el momento del cálculo.
 * @property {'hombre'|'mujer'} gender           - Género biológico; determina la fórmula de TMB a aplicar.
 * @property {number} activity                   - Factor de actividad física (1.2 – 2.5).
 * @property {number} [imc]                      - Índice de Masa Corporal calculado (peso / altura²).
 * @property {number} [tmb]                      - Tasa Metabólica Basal calculada en kcal/día.
 * @property {number} [tdee]                     - Gasto Energético Total Diario (TMB × actividad).
 */
const HealthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: {
      // Enum cerrado: las fórmulas de TMB dependen del género biológico
      type: String,
      enum: ["hombre", "mujer"],
      required: true,
    },
    // Factor multiplicador de actividad para calcular TDEE (ej: 1.2 = sedentario, 1.725 = muy activo)
    activity: { type: Number, required: true },

    // Resultados del cálculo persistidos para histórico y rendimiento en consultas
    imc: Number,
    tmb: Number,
    tdee: Number,
  },
  {
    // timestamps genera createdAt y updatedAt automáticamente; createdAt actúa como fecha del registro
    timestamps: true,
    versionKey: false,
  },
);

const Health = mongoose.model("Health", HealthSchema);
module.exports = Health;
