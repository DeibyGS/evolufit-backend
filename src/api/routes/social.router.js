/**
 * SOCIAL & COMMUNITY ROUTER - EVOLUTFIT
 * Arquitectura de rutas protegida con validación integral (Body, Params, Query).
 */
const socialRouter = require("express").Router();
const validate = require("../../../utils/validate");
const { isAuth } = require("../../middlewares/auth");

// Importamos los nuevos esquemas estructurados
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
socialRouter.get(
  "/",
  isAuth,
  validate(filterPostSchema), // Valida req.query (sort, muscle, search, page, limit)
  getSocialPosts,
);

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
 * @note    Cambiado a PATCH por ser una actualización parcial.
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
socialRouter.put(
  "/:id",
  isAuth,
  validate(updatePostSchema), // Valida req.params.id Y req.body simultáneamente
  updatePost,
);

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
