/**
 * USER MODEL - EVOLUTFIT
 * Define la estructura de identidad, seguridad y perfil de los atletas.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

/**
 * Esquema de Usuario.
 * Gestiona la información personal y las credenciales de acceso.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Elimina espacios accidentales
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: [14, "Debes tener al menos 14 años para usar EvolutFit"],
      max: [100, "Por favor, introduce una edad válida"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

/**
 * MIDDLEWARE PRE-SAVE
 * Lógica de seguridad que se ejecuta antes de guardar el documento en la DB.
 * Garantiza el hashing de la contraseña de forma automática.
 */
userSchema.pre("save", async function () {
  // 1. Optimización: Si la contraseña no ha sido modificada, omitimos el proceso
  if (!this.isModified("password")) return;

  // 2. Seguridad: Verificamos si la cadena ya tiene formato de hash de Bcrypt
  // para evitar doble encriptación en ciertos flujos de actualización.
  if (this.password.startsWith("$2b$")) return;

  // 3. Proceso de Cifrado
  // Generamos una semilla (salt) de nivel 10 (estándar de industria)
  const salt = await bcrypt.genSalt(10);
  // Sustituimos el texto plano por el hash seguro
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Registro del modelo en Mongoose.
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
