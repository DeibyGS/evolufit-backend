/**
 * SOCIAL MODEL - EVOLUTFIT
 * Define la estructura de las publicaciones y la interacción social entre usuarios.
 *
 * Decisiones de diseño relevantes:
 * - `likes` es un array de ObjectIds en lugar de un contador numérico porque:
 *   a) Permite verificar en O(1) si un usuario ya dio like (búsqueda en el array).
 *   b) Posibilita la operación toggle (añadir/quitar) con $addToSet / $pull en MongoDB.
 *   c) `likes.length` en el controlador sirve directamente como métrica de popularidad.
 *   Desventaja: posts muy populares generan documentos grandes; aceptable para el alcance del TFG.
 * - `muscleGroups` valida contra la constante `MUSCLE_GROUPS` para mantener consistencia
 *   con los filtros del feed y con el modelo de workout.
 * - El campo `userId` no tiene `select: false` porque se necesita en el feed para
 *   mostrar el nombre del autor (se hace populate en el controlador).
 */

const mongoose = require("mongoose");
const { MUSCLE_GROUPS } = require("../../constants/exerciseList");
const { Schema } = mongoose;

/**
 * @typedef {object} SocialDocument
 * @property {mongoose.Types.ObjectId}   userId       - Autor de la publicación.
 * @property {string}                    title        - Título del post (5–100 caracteres).
 * @property {string}                    content      - Descripción detallada de la rutina (10–2000 caracteres).
 * @property {string[]}                  muscleGroups - Tags de grupos musculares involucrados (1–5 valores del enum).
 * @property {mongoose.Types.ObjectId[]} likes        - IDs de usuarios que han dado like; su longitud equivale al contador de popularidad.
 */
const socialSchema = new Schema(
  {
    /**
     * Referencia al autor de la publicación.
     * Se usa en populate para mostrar nombre e información del usuario en el feed.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "La descripción de la rutina es obligatoria"],
    },

    /**
     * Tags de grupos musculares del post.
     * Permite filtrar el feed por categoría y etiquetar posts con múltiples grupos
     * (ej: una rutina de "Pecho" y "Tríceps" aparece en ambos filtros).
     */
    muscleGroups: [
      {
        type: String,
        enum: MUSCLE_GROUPS,
        required: true,
      },
    ],

    /**
     * Array de IDs de usuarios que han dado like.
     * Se usa $addToSet para añadir (evita duplicados) y $pull para quitar.
     * `post.likes.length` en el controlador determina el contador de popularidad.
     */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // versionKey: false elimina el campo __v de Mongoose
    // timestamps: true crea createdAt (fecha de publicación) y updatedAt automáticamente
    versionKey: false,
    timestamps: true,
  },
);

/**
 * Registro del modelo en Mongoose bajo la colección 'socials'.
 */
const Social = mongoose.model("Social", socialSchema);

module.exports = Social;
