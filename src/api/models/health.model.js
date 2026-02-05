const mongoose = require("mongoose");

const HealthSchema = new mongoose.Schema({
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

  imc: Number,
  tmb: Number,
  tdee: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  versionKey: false,
});

const Health = mongoose.model("HealthRecords", HealthSchema);

module.exports = Health;
