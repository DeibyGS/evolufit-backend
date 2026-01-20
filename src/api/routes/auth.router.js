/**
 * AUTHENTICATION ROUTER - EVOLUTFIT
 * Definición de rutas públicas para la gestión de acceso y registro.
 */

const { register, login } = require("../controllers/auth.controller");

// Inicialización del router de Express
const authRouter = require("express").Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registro de nuevos atletas.
 * @access  Público
 */
authRouter.post("/register", register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Autenticación de usuarios y entrega de Token JWT.
 * @access  Público
 */
authRouter.post("/login", login);

/**
 * Exportación del router para su integración en el index.js (Main Server)
 */
module.exports = authRouter;
