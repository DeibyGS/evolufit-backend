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
    // 1. Obtención del token desde los headers de la petición HTTP.
    // El cliente debe enviar: Authorization: Bearer <token>
    const token = req.headers.authorization?.split(" ")[1];

    // Si el token no existe, cortamos el flujo inmediatamente con un 401 (Unauthorized).
    if (!token) {
      return res.status(401).json({ message: "No se proporcionó un token" });
    }

    // 2. Verificación de integridad del token.
    // Se comprueba que el token haya sido firmado por nuestro servidor y no haya expirado.
    const decoded = verifyToken(token);

    // 3. Validación de persistencia.
    // Confirmamos que el usuario codificado en el token aún existe en nuestra base de datos.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario no encontrado o cuenta eliminada" });
    }

    // 4. Inyección de identidad en la Request.
    // Al asignar el usuario a 'req.user', permitimos que los controladores posteriores
    // (como los de Workouts o RM) sepan exactamente quién realiza la acción.
    req.user = user;

    // 5. Autorización exitosa.
    // Saltamos al controlador final o al siguiente middleware en la cadena.
    next();
  } catch (error) {
    // Cualquier fallo en la verificación (token manipulado, expirado, etc.)
    // resulta en un acceso denegado.
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = { isAuth };
