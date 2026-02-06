/**
 * USER ROUTER - EVOLUTFIT
 * Gestión de perfiles, seguridad y administración.
 */

const validate = require("../../../utils/validate");
const {
  updateValidatorSchema,
  changePasswordSchema,
} = require("../../validators/userValidator");

const { isAuth } = require("../../middlewares/auth");
const {
  getAllUsers,
  getUserById,
  updatePassword,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

// Inicialización del router de Express
const userRouter = require("express").Router();

/**
 * @route   GET /api/v1/user
 * @desc    Obtiene la lista de todos los usuarios (Ranking/Admin).
 * @access  Público
 */
userRouter.get("/", getAllUsers);

/**
 * @route   GET /api/v1/user/:id
 * @desc    Ver perfil público de otro atleta por su ID.
 * @access  Público
 */
userRouter.get("/:id", getUserById);

/**
 * @route   PATCH /api/v1/user/change-password
 * @desc    Actualiza la contraseña del usuario autenticado.
 * @access  Privado (Identidad por Token)
 */
userRouter.patch(
  "/change-password",
  isAuth,
  validate(changePasswordSchema),
  updatePassword,
);

/**
 * @route   PUT /api/v1/user/profile
 * @desc    Actualiza datos generales del perfil propio (Nombre, edad, etc.).
 * @access  Privado (Identidad por Token)
 */
userRouter.put("/profile", isAuth, validate(updateValidatorSchema), updateUser);

/**
 * @route   DELETE /api/v1/user/delete-me
 * @desc    Elimina o desactiva la cuenta del usuario autenticado.
 * @access  Privado (Identidad por Token)
 */
userRouter.delete("/delete-me", isAuth, deleteUser);

/**
 * Exportación para su integración en el servidor principal.
 */
module.exports = userRouter;
