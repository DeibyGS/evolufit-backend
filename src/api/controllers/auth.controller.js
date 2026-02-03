/**
 * AUTHENTICATION CONTROLLER - EVOLUTFIT
 * Gestión de acceso y creación de cuentas de usuario.
 */

const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateSign } = require("../../../utils/jwt");

/**
 * Lógica para el registro de nuevos atletas en la plataforma.
 */
const register = async (req, res) => {
  try {
    const { name, lastname, email, age, password } = req.body;

    // 1. Verificar si el usuario ya existe en la base de datos (evita duplicidad de email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Este correo ya está registrado" });
    }

    // 2. Instancia de nuevo usuario
    // Nota técnica: Se asume que el cifrado de la password se gestiona vía middleware pre-save en el esquema de Mongoose.
    const newUser = new User({
      name,
      lastname,
      email,
      age,
      password,
    });

    // Persistencia de los datos en MongoDB
    await newUser.save();

    // 3. Generación automática del Token JWT tras el registro exitoso
    const token = generateSign(newUser._id);

    // 4. Sanitización de datos de salida (Seguridad)
    // Se elimina la propiedad 'password' del objeto plano antes de enviarlo al cliente.
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // 5. Respuesta de creación exitosa (HTTP 201 Created)
    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: userResponse,
      token,
    });
  } catch (error) {
    // Registro de logs de error para depuración en servidor
    console.error("Error en el registro:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/**
 * Lógica para la autenticación y validación de credenciales.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Localización del usuario mediante el identificador único (email)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Comparación de la contraseña enviada con el hash almacenado
    if (bcrypt.compareSync(password, user.password)) {
      // 3. Generación del Token de sesión si la identidad es válida
      const token = generateSign(user._id);

      // 4. Preparación de la respuesta omitiendo información sensible
      const userResponse = user.toObject();
      delete userResponse.password;

      // 5. Respuesta de acceso concedido (HTTP 200 OK)
      return res.status(200).json({
        message: "Login exitoso",
        user: userResponse,
        token,
      });
    } else {
      // HTTP 401 Unauthorized para fallos de contraseña
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
