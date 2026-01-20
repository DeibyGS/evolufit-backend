/**
 * JWT UTILITIES - EVOLUTFIT
 * Herramientas para la creación y validación de JSON Web Tokens.
 */

const jwt = require("jsonwebtoken");

/**
 * Genera una firma digital (Token) para un usuario.
 * @param {string} id - El identificador único del usuario (MongoDB _id).
 * @returns {string} Token JWT firmado.
 */
const generateSign = (id) => {
  // 1. Payload: Guardamos el ID del usuario dentro del token.
  // 2. Secret: Utiliza una clave privada del .env para firmar el token.
  // 3. Options: Se establece una duración de 30 días para la sesión del atleta.
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
 * Verifica la autenticidad de un token recibido.
 * @param {string} token - El token enviado por el frontend en los headers.
 * @returns {Object} El payload decodificado (contiene el id) si es válido.
 * @throws Error si el token ha expirado o la firma ha sido manipulada.
 */
const verifyToken = (token) => {
  // Compara el token con el JWT_SECRET para asegurar que fue emitido por este servidor.
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateSign,
  verifyToken,
};
