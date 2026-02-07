/**
 * JWT UTILITIES - EVOLUTFIT
 * Herramientas para la creación y validación de JSON Web Tokens con manejo de errores robusto.
 */

const jwt = require("jsonwebtoken");

/**
 * Genera una firma digital (Token) para un usuario.
 */
const generateSign = (id) => {
  // Verificación preventiva: Si no hay ID, no generamos token.
  if (!id) {
    throw new Error("Se requiere un ID de usuario para generar el token");
  }

  // HARDENING: Usamos un algoritmo explícito (HS256) y un payload limpio.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
    algorithm: "HS256",
  });
};

/**
 * Verifica la autenticidad de un token recibido.
 * Implementa un manejo de excepciones específico para ayudar al Frontend (React/React Native).
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error("Token no proporcionado");
    }

    // Verificación con el secreto del entorno
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // BUG HUNTING: Diferenciamos el error para que el log sea útil
    if (error instanceof jwt.TokenExpiredError) {
      console.error("❌ [AUTH] Token expirado en sesión de usuario.");
      throw new Error("TOKEN_EXPIRED");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`❌ [AUTH] Error de firma/malformación: ${error.message}`);
      throw new Error("TOKEN_INVALID");
    }

    throw error;
  }
};

module.exports = {
  generateSign,
  verifyToken,
};
