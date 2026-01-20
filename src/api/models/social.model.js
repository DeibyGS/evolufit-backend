/**
 * SOCIAL MODEL - EVOLUTFIT
 * Define la estructura de las publicaciones y la interacción social entre usuarios.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Esquema para las publicaciones de la comunidad.
 * Permite compartir rutinas, descripciones y gestionar la popularidad mediante likes.
 */
const socialSchema = new Schema(
  {
    /**
     * Referencia al autor de la publicación.
     * Conecta el post con el perfil del usuario para mostrar su nombre/avatar en el feed.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Título de la rutina o post.
     * trim: true elimina espacios innecesarios al inicio y final.
     */
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },

    /**
     * Cuerpo del post o descripción detallada de la sesión compartida.
     */
    content: {
      type: String,
      required: [true, "La descripción de la rutina es obligatoria"],
    },

    /**
     * Tags de grupos musculares involucrados.
     * Este array permite que una sola rutina sea filtrada por varios grupos (ej: "Pecho" y "Tríceps").
     */
    muscleGroups: [
      {
        type: String,
        required: true,
      },
    ],

    /**
     * Sistema de interacción social.
     * Almacena un array de IDs de usuarios que han reaccionado.
     * El tamaño de este array determina el 'popularidad' del post en el controlador.
     */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    /**
     * versionKey: false elimina el campo __v de Mongoose.
     * timestamps: true crea createdAt y updatedAt automáticamente.
     */
    versionKey: false,
    timestamps: true,
  },
);

/**
 * Registro del modelo en Mongoose bajo la colección 'socials'.
 */
const Social = mongoose.model("Social", socialSchema);

module.exports = Social;
