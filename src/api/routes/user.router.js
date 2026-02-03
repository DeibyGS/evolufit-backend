/**
 * USER ROUTER - EVOLUTFIT
 * Definición de endpoints para la gestión de perfiles, actualización de seguridad y administración.
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
 * @desc    Obtiene la lista de todos los usuarios registrados.
 * @access  Público (Nota: En producción se recomienda proteger con isAuth + isAdmin)
 */
userRouter.get("/", getAllUsers);

/**
 * @route   GET /api/v1/user/:id
 * @desc    Obtiene la información detallada de un perfil por su ID.
 * @access  Público
 */
userRouter.get("/:id", getUserById);

/**
 * @route   PUT /api/v1/user/:id/change-password
 * @desc    Actualiza la contraseña del usuario.
 * @access  Privado (Requiere validación de identidad)
 */
userRouter.put(
  "/:id/change-password",
  isAuth,
  validate(changePasswordSchema),
  updatePassword,
);

/**
 * @route   PUT /api/v1/user/:id
 * @desc    Actualiza datos generales del perfil (Nombre, edad, etc.).
 * @access  Privado
 */
userRouter.put("/:id", isAuth, validate(updateValidatorSchema), updateUser);

/**
 * @route   DELETE /api/v1/user/:id
 * @desc    Elimina la cuenta de usuario de forma permanente.
 * @access  Privado (Requiere validación de identidad estricta)
 */
userRouter.delete("/:id", isAuth, deleteUser);

/**
 * Exportación para su integración en el servidor principal.
 */
module.exports = userRouter;
