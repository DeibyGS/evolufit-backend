/**
 * SOCIAL & COMMUNITY ROUTER - EVOLUTFIT
 * Define los puntos de acceso para la interacción entre atletas y el feed de rutinas.
 */

const { isAuth } = require("../../middlewares/auth");
const {
  getSocialPosts,
  createPost,
  toggleLike,
} = require("../controllers/social.controller");

// Inicialización del router de Express
const socialRouter = require("express").Router();

/**
 * @route   GET /api/v1/social
 * @desc    Obtiene el feed de publicaciones.
 * @query   sort (popular/oldest), muscle (grupo muscular), search (texto libre).
 * @access  Privado
 */
socialRouter.get("/", isAuth, getSocialPosts);

/**
 * @route   POST /api/v1/social
 * @desc    Publica una nueva rutina o contenido en el muro de la comunidad.
 * @access  Privado
 */
socialRouter.post("/", isAuth, createPost);

/**
 * @route   POST /api/v1/social/:id/like
 * @desc    Alterna (Toggle) el estado de 'Like' en una publicación específica.
 * @param   id - Identificador único de la publicación.
 * @access  Privado
 */
socialRouter.post("/:id/like", isAuth, toggleLike);

/**
 * Exportación del router para su integración en la arquitectura global de la API.
 */
module.exports = socialRouter;
