/**
 * MIDDLEWARE DE AUTENTICACIÓN - EVOLUTFIT
 * Ubicación: /src/middlewares/auth.js
 *
 * Protege las rutas privadas verificando que la petición incluye
 * un JWT válido y no expirado. Si el token es correcto, inyecta
 * el documento del usuario en `req.user` para que los controladores
 * puedan acceder a él sin hacer una segunda consulta a la base de datos.
 */

const { verifyToken } = require("../../utils/jwt");
const User = require("../api/models/User.model");

/**
 * Middleware `isAuth` — guarda de acceso para rutas privadas.
 *
 * Flujo:
 * 1. Extrae el token del header `Authorization: Bearer <token>`.
 * 2. Lo verifica con `verifyToken` (lanza excepción si es inválido o ha expirado).
 * 3. Busca el usuario en BD con `.lean()` y sin el campo `password`.
 * 4. Si todo es correcto, adjunta el usuario a `req.user` y llama a `next()`.
 *
 * @decision `.select("-password")` excluye el hash de la contraseña del objeto
 *           que se inyecta en req.user, evitando que llegue accidentalmente a
 *           una respuesta al cliente a través de los controladores.
 *
 * @decision `.lean()` devuelve un objeto JavaScript plano en lugar de un
 *           documento Mongoose. Es más rápido y consume menos memoria porque
 *           no incluye métodos ni getters del modelo. Suficiente aquí porque
 *           los controladores solo leen los datos, no los modifican.
 *
 * @decision Se distingue entre `TokenExpiredError` y otros errores JWT para
 *           dar un mensaje claro al frontend (el token expirado es un caso
 *           esperado en sesiones largas, no un error de programación).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const isAuth = async (req, res, next) => {
  try {
    // El estándar Bearer requiere exactamente un espacio después de "Bearer"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Formato de autorización inválido" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Buscamos el usuario sin el hash de contraseña, como objeto plano (lean)
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Adjuntamos el usuario al objeto req para que los controladores lo tengan disponible
    req.user = user;
    next();
  } catch (error) {
    // TokenExpiredError es el nombre exacto que lanza jsonwebtoken al expirar el token
    const message =
      error.name === "TokenExpiredError" ? "Token expirado" : "Token inválido";
    return res.status(401).json({ message });
  }
};

module.exports = { isAuth };
