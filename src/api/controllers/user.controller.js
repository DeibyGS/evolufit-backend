/**
 * USER MANAGEMENT CONTROLLER - EVOLUTFIT
 * Operaciones CRUD de perfiles de usuario y gestión de seguridad.
 */

const User = require("../models/User.model");
const bcrypt = require("bcrypt");

/**
 * Recupera la lista completa de usuarios registrados.
 * Principalmente para uso administrativo o debug interno.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Obtiene un perfil de usuario específico mediante su ID de MongoDB.
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ACTUALIZAR PERFIL (DATOS GENERALES)
 * @desc Actualiza nombre, apellido, edad, etc.
 */
const updateUser = async (req, res) => {
  try {
    // Extraemos el ID del token (inyectado por isAuth)
    const userId = req.user._id;

    // Actualizamos usando findByIdAndUpdate para eficiencia
    // El req.body ya viene filtrado y validado por updateValidatorSchema (Zod)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      {
        new: true, // Devuelve el documento ya actualizado
        runValidators: true, // Asegura que se respeten las validaciones del modelo
      },
    ).select("-password"); // Excluimos la contraseña por seguridad

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
 * ACTUALIZAR CONTRASEÑA
 * @desc Cambia la contraseña disparando el middleware pre("save")
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body; // Nueva contraseña validada por Zod

    // 1. Buscamos el documento de usuario
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // 2. Asignamos la nueva contraseña en texto plano.
    // Mongoose detectará el cambio gracias a tu middleware .pre("save")
    user.password = password;

    // 3. Guardamos. Aquí se dispara: if (!this.isModified("password")) de tu modelo.
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("🔥 Error en updatePassword:", error);
    res.status(500).json({
      status: "error",
      message: "No se pudo actualizar la contraseña",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // 1. Obtenemos el ID directamente del token (Seguridad total)
    const userId = req.user._id;

    // 2. Eliminamos
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
