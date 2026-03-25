/**
 * ROUTER SOCIAL Y COMUNIDAD - EVOLUTFIT
 * Rutas del módulo de feed y publicaciones. Todas son privadas (requieren isAuth).
 * Cada ruta aplica validación específica: body, params.id o ambos según el caso.
 */
const socialRouter = require("express").Router();
const validate = require("../../../utils/validate");
const { isAuth } = require("../../middlewares/auth");

// Esquemas de validación Zod para cada tipo de operación del módulo social
const {
  createPostSchema,
  filterPostSchema,
  postIdParamSchema,
  updatePostSchema,
} = require("../../validators/socialValidator");

const {
  getSocialPosts,
  createPost,
  toggleLike,
  updatePost,
  deletePost,
} = require("../controllers/social.controller");

/**
 * @route   GET /api/v1/social
 * @desc    Obtiene el feed con filtros y paginación.
 */
socialRouter.get("/", isAuth, getSocialPosts);

/**
 * @route   POST /api/v1/social
 * @desc    Publica una nueva rutina.
 */
socialRouter.post(
  "/",
  isAuth,
  validate(createPostSchema), // Valida req.body (title, content, muscleGroups)
  createPost,
);

/**
 * @route   PATCH /api/v1/social/:id/like
 * @desc    Toggle Like.
 * @nota    Se usa PATCH y no PUT porque es una actualización parcial (solo el campo likes).
 */
socialRouter.patch(
  "/:id/like",
  isAuth,
  validate(postIdParamSchema), // Valida req.params.id (ObjectId format)
  toggleLike,
);

/**
 * @route   PUT /api/v1/social/:id
 * @desc    Edita un post propio.
 */
socialRouter.put("/:id", isAuth, validate(updatePostSchema), updatePost);

/**
 * @route   DELETE /api/v1/social/:id
 * @desc    Elimina un post propio.
 */
socialRouter.delete(
  "/:id",
  isAuth,
  validate(postIdParamSchema), // Valida req.params.id
  deletePost,
);

module.exports = socialRouter;
