/**
 * CONTROLADOR DE GESTIÓN DE USUARIOS - EVOLUTFIT
 * Operaciones CRUD sobre perfiles de usuario: consulta, actualización y eliminación.
 */

const User = require("../models/User.model");
const bcrypt = require("bcrypt");

/**
 * Devuelve la lista completa de usuarios registrados.
 * Uso interno: depuración y administración. No está expuesto en producción
 * sin un middleware de autorización por rol de administrador.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      // Se devuelve 404 en lugar de array vacío para indicar que no hay datos
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

/**
 * Obtiene el perfil completo de un usuario por su ID de MongoDB.
 *
 * @caso_borde Si el `id` no tiene el formato correcto de ObjectId (24 caracteres hex),
 *             Mongoose lanza un CastError que Express convierte en 500. Para mejorarlo
 *             en el futuro se podría validar el formato antes con `mongoose.isValidObjectId`.
 *
 * @param {import('express').Request} req - Params: id (ObjectId del usuario).
 * @param {import('express').Response} res
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

/**
 * Actualiza los datos del perfil del usuario autenticado (nombre, edad, etc.).
 * No gestiona cambios de contraseña; para eso existe `updatePassword`.
 *
 * @decision Se usa `findByIdAndUpdate` con `{ new: true }` para recibir el documento
 *           ya actualizado en la respuesta, evitando una segunda consulta a BD.
 *
 * @decision `.select("-password")` excluye el hash de la contraseña de la respuesta.
 *           Es una medida defensiva: aunque el middleware isAuth ya omite la contraseña
 *           en req.user, aquí se accede directamente a la BD y hay que ser explícito.
 *
 * @decision El body ya llega validado y filtrado por el validador Zod correspondiente,
 *           por lo que se puede usar `$set: req.body` con seguridad.
 *
 * @param {import('express').Request} req - `req.user._id` inyectado por isAuth.
 * @param {import('express').Response} res
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      {
        new: true,          // Devuelve el documento ya actualizado, no el anterior
        runValidators: true, // Aplica las validaciones del schema Mongoose al actualizar
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Error en updateUser:", error);
    res.status(500).json({
      status: "error",
      message: "Fallo al actualizar los datos del perfil",
    });
  }
};

/**
 * Cambia la contraseña del usuario autenticado verificando primero la contraseña actual.
 *
 * @decision A diferencia del flujo de recuperación (forgotPassword/resetPassword),
 *           aquí se exige la contraseña actual. Esto protege al usuario si su sesión
 *           quedó abierta en un dispositivo ajeno.
 *
 * @decision Se usa `user.save()` en lugar de `findByIdAndUpdate` porque `findByIdAndUpdate`
 *           NO dispara el middleware pre("save") del modelo, que es el que hashea
 *           la contraseña antes de persistirla.
 *
 * @param {import('express').Request} req - Body: oldPassword, password. `req.user._id` por isAuth.
 * @param {import('express').Response} res
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, password } = req.body;

    // Se necesita el documento completo (con el hash) para poder compararlo con bcrypt
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificamos que la contraseña actual enviada coincide con el hash almacenado
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message:
          "La contraseña actual es incorrecta. No se puede realizar el cambio.",
      });
    }

    // Asignamos en plano; el pre("save") del modelo se encarga del hash
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al intentar cambiar la contraseña" });
  }
};

/**
 * Elimina permanentemente la cuenta del usuario autenticado.
 *
 * @decision El ID se extrae del token (req.user._id) y no de los parámetros de la URL.
 *           Esto garantiza que un usuario solo puede eliminar su propia cuenta,
 *           sin posibilidad de indicar un ID ajeno en la petición.
 *
 * @caso_borde Esta operación no elimina en cascada los entrenamientos, registros RM
 *             ni publicaciones sociales del usuario. Sería necesario implementar
 *             un hook post("findOneAndDelete") en el modelo o limpiarlos aquí.
 *
 * @param {import('express').Request} req - `req.user._id` inyectado por isAuth.
 * @param {import('express').Response} res
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const userDeleted = await User.findByIdAndDelete(userId);

    if (!userDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Cuenta eliminada permanentemente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al intentar eliminar la cuenta",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updatePassword,
  updateUser,
  deleteUser,
};
