const mongoose = require("mongoose");

/**
 * HEALTH RECORD MODEL - EVOLUTFIT
 * Estructura corregida para persistencia de métricas biométricas.
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
      type: String,
      enum: ["hombre", "mujer"],
      required: true,
    },
    activity: { type: Number, required: true },

    // Campos calculados
    imc: Number,
    tmb: Number,
    tdee: Number,

    // Nota: 'createdAt' ya no es necesario definirlo manualmente
    // porque 'timestamps: true' lo crea por ti.
  },
  {
    // Opciones del esquema
    timestamps: true, // Crea 'createdAt' y 'updatedAt' automáticamente
    versionKey: false, // Elimina el campo '__v'
  },
);

module.exports = mongoose.model("Health", HealthSchema);
