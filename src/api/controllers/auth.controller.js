/**
 * AUTHENTICATION CONTROLLER - EVOLUTFIT
 */

const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { generateSign } = require("../../../utils/jwt");

const register = async (req, res) => {
  try {
    const { name, lastname, email, age, password } = req.body;

    // 1. Verificación de duplicidad
    // Usamos el email ya normalizado por Zod (lowercase)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Usar 409 (Conflict) es más preciso semánticamente que 400
      return res.status(409).json({
        status: "error",
        errors: [
          { path: "email", message: "Este correo electrónico ya está en uso" },
        ],
      });
    }

    // 2. Creación del usuario
    // El password se hasheará automáticamente gracias a tu middleware pre("save")
    const newUser = new User({ name, lastname, email, age, password });
    await newUser.save();

    // 3. Generación de Token
    const token = generateSign(newUser._id);

    // 4. Sanitización
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "¡Bienvenido a EvolutFit!",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("🔥 Error en el registro:", error);
    res.status(500).json({ message: "Error crítico al crear la cuenta" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Búsqueda del usuario
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, algunos prefieren decir "Credenciales inválidas"
      // para no dar pistas de qué emails existen, pero 404 es útil en desarrollo.
      return res
        .status(404)
        .json({ message: "El correo electrónico no está registrado" });
    }

    // 2. Validación de contraseña (Uso de compare asíncrono recomendado)
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = generateSign(user._id);

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        message: "Sesión iniciada correctamente",
        user: userResponse,
        token,
      });
    } else {
      return res.status(401).json({ message: "La contraseña es incorrecta" });
    }
  } catch (error) {
    console.error("🔥 Error en el login:", error);
    res.status(500).json({ message: "Error al procesar la autenticación" });
  }
};

module.exports = { register, login };
