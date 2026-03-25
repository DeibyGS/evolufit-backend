/**
 * USER MODEL - EVOLUTFIT
 * Define la estructura de identidad, seguridad y perfil de los atletas.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

/**
 * @typedef {object} UserDocument
 * @property {string}  name                  - Nombre del atleta.
 * @property {string}  lastname              - Apellido del atleta.
 * @property {number}  age                   - Edad (mínimo 14 por restricción legal/uso responsable de la app).
 * @property {string}  email                 - Correo único e indexado; se normaliza a minúsculas para evitar duplicados por capitalización.
 * @property {string}  password              - Contraseña hasheada con bcrypt. Nunca se devuelve en consultas SELECT.
 * @property {boolean} isActive              - Permite desactivar cuentas sin borrarlas (borrado lógico).
 * @property {string}  [resetPasswordToken]  - Token temporal generado al solicitar recuperación de contraseña.
 * @property {Date}    [resetPasswordExpires] - Fecha de expiración del token de recuperación; evita tokens de vida infinita.
 */

/**
 * Esquema de Usuario.
 *
 * Decisiones de diseño relevantes:
 * - `email` tiene `unique: true` → Mongoose crea automáticamente un índice único en MongoDB.
 *   Si dos registros llegan al mismo tiempo con el mismo email, MongoDB rechaza el duplicado
 *   con un error E11000; el error handler global debe capturarlo y devolver 409.
 * - `isActive` usa borrado lógico: el usuario no se elimina físicamente, permitiendo
 *   auditoría y recuperación de cuenta futura sin pérdida de historial asociado.
 * - `resetPasswordToken` y `resetPasswordExpires` se almacenan en el propio documento
 *   para evitar una colección adicional; se limpian tras el uso exitoso del token.
 * - `versionKey: false` elimina el campo `__v` de Mongoose (control de versiones interno
 *   que no aporta valor en esta API).
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Elimina espacios accidentales al inicio y final
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      // Mínimo 14 años: restricción de uso responsable de la aplicación
      min: [14, "Debes tener al menos 14 años para usar EvolutFit"],
      max: [100, "Por favor, introduce una edad válida"],
    },
    email: {
      type: String,
      required: true,
      // unique genera un índice único en MongoDB; los duplicados lanzarán error E11000
      unique: true,
      trim: true,
      // lowercase normaliza antes de guardar para evitar duplicados por capitalización (ej: "User@mail.com" vs "user@mail.com")
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    // Permite desactivar cuentas sin eliminarlas (borrado lógico)
    isActive: {
      type: Boolean,
      default: true,
    },
    // Token temporal para el flujo de recuperación de contraseña vía email
    resetPasswordToken: { type: String },
    // Fecha límite del token; pasada esta fecha, el token debe rechazarse en el controlador
    resetPasswordExpires: { type: Date },
  },
  {
    versionKey: false,
    // timestamps añade createdAt y updatedAt automáticamente para auditoría
    timestamps: true,
  },
);

/**
 * Hook pre-save: hashea la contraseña antes de persistir el documento.
 *
 * Se usa un hook de Mongoose en lugar de hashear en el controlador para garantizar
 * que cualquier ruta que modifique el documento (register, reset-password, etc.)
 * pase siempre por el proceso de cifrado sin duplicar lógica.
 *
 * Casos borde contemplados:
 * 1. Si la contraseña no fue modificada (ej: actualización de nombre), se omite el hash.
 * 2. Si la contraseña ya tiene formato bcrypt (`$2b$`), se omite para evitar doble hasheo
 *    en flujos donde el valor ya fue procesado previamente.
 */
userSchema.pre("save", async function () {
  // Caso 1: campo no modificado → no rehashear (evita trabajo innecesario en updates parciales)
  if (!this.isModified("password")) return;

  // Caso 2: valor ya hasheado → no rehashear (prefijo estándar de bcrypt v2b)
  if (this.password.startsWith("$2b$")) return;

  // Generamos una semilla (salt) con factor de coste 10: balance recomendado entre seguridad y rendimiento
  const salt = await bcrypt.genSalt(10);
  // Reemplazamos el texto plano por el hash irreversible
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Registro del modelo en Mongoose.
 * Mongoose mapeará este schema a la colección 'users' en MongoDB Atlas.
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
