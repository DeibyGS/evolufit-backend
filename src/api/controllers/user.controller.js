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
 * Actualiza la información del perfil (nombre, edad, etc.).
 * @param {Object} req.body - Campos a actualizar.
 * @option runValidators - Fuerza la ejecución de validaciones definidas en el esquema.
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, // Retorna el documento ya actualizado
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Gestión de cambio de contraseña con verificación de identidad.
 */
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // 1. Verificación de permisos: Comparación del ID del Token vs ID del parámetro
    // Esto garantiza que un usuario solo pueda cambiar su propia contraseña.
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // 2. Validación de credencial actual
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "La contraseña actual es incorrecta" });
    }

    // 3. Actualización de Password:
    // Al asignar el valor en texto plano y ejecutar .save(), se dispara el middleware
    // .pre("save") del modelo para encriptar la nueva clave.
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/**
 * Eliminación definitiva de la cuenta de usuario.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Capa de Seguridad: Validar que el solicitante es el dueño de la cuenta
    // Imprescindible para evitar borrados accidentales o malintencionados.
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        message:
          "No tienes permiso para eliminar una cuenta que no te pertenece.",
      });
    }

    const userDeleted = await User.findByIdAndDelete(id);

    if (!userDeleted) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario eliminado correctamente",
      user: userDeleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al intentar eliminar el usuario",
      error: error.message,
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
