/**
 * ROUTER DE AUTENTICACIÓN - EVOLUTFIT
 * Rutas públicas de acceso, registro y recuperación de contraseña.
 * La única ruta privada es PATCH /change-password (requiere isAuth).
 */

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePasswordProfile,
} = require("../controllers/auth.controller");

const validate = require("../../../utils/validate");
const {
  loginValidatorSchema,
  registerValidatorSchema,
  changePasswordSchema,
} = require("../../validators/userValidator");
const { isAuth } = require("../../middlewares/auth");
// Inicialización del router de Express
const authRouter = require("express").Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registro de nuevos atletas.
 */
authRouter.post("/register", validate(registerValidatorSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autenticación de usuarios.
 */
authRouter.post("/login", validate(loginValidatorSchema), login);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Solicita el enlace de recuperación (envía email).
 */
authRouter.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Establece la nueva contraseña usando el token de la URL.
 */
authRouter.post("/reset-password/:token", resetPassword);

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Cambia la contraseña del usuario autenticado (requiere la contraseña actual).
 * @access  Privado (isAuth)
 */
authRouter.patch(
  "/change-password",
  isAuth,
  validate(changePasswordSchema),
  changePasswordProfile,
);

module.exports = authRouter;
