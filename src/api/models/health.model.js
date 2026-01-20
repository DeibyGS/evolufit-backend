/**
 * HEALTH RECORD MODEL - EVOLUTFIT
 * Define la estructura de persistencia para las métricas biométricas de los usuarios.
 */

const mongoose = require("mongoose");

/**
 * Esquema para el almacenamiento de registros de salud y metabolismo.
 * Cada documento representa una captura puntual de las métricas del usuario.
 */
const HealthSchema = new mongoose.Schema({
  /**
   * Referencia al usuario propietario del registro.
   * Crea una relación (Foreign Key lógica) con la colección 'users'.
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Valor absoluto del peso corporal (normalmente en kg)
  weight: Number,

  // Índice de Masa Corporal (IMC) - Cálculo basado en peso/altura
  imc: Number,

  // Tasa Metabólica Basal (TMB) - Calorías mínimas en reposo
  tmb: Number,

  // Gasto Energético Total Diario (TDEE) - Calorías según actividad
  tdee: Number,

  /**
   * Marca de tiempo automática para análisis temporal.
   * Crucial para generar gráficas de evolución en el tiempo.
   */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Exportación del modelo 'HealthRecord'.
 * Mongoose lo mapeará automáticamente a una colección llamada 'healthrecords' en minúsculas.
 */
module.exports = mongoose.model("HealthRecord", HealthSchema);
