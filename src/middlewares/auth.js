/**
 * AUTHENTICATION UTILITY MIDDLEWARE - EVOLUTFIT
 * Ubicación: /src/utils/auth.js
 * Este archivo actúa como el escudo protector de las rutas privadas.
 */

const { verifyToken } = require("../../utils/jwt"); // Importación desde la misma carpeta utils
const User = require("../api/models/User.model"); // Ajuste de ruta hacia el modelo de usuario

/**
 * Middleware para validar la sesión del usuario.
 * Se encarga de transformar un Token JWT en una identidad de usuario válida.
 */
const isAuth = async (req, res, next) => {
  try {
    // 1. Extracción del token desde el header Authorization (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Formato de autorización inválido" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token); // Verificación del token y decodificación del payload
    const user = await User.findById(decoded.id).select("-password").lean();

    // Búsqueda del usuario en la base de datos sin el campo password
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // 2. Adjuntamos el usuario al objeto req para que esté disponible en los controladores
    req.user = user;
    next(); // Continuamos al siguiente middleware o controlador
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Token expirado" : "Token inválido";
    return res.status(401).json({ message });
  }
};

module.exports = { isAuth };
