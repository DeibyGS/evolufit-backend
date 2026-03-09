/**
 * AUTHENTICATION CONTROLLER - EVOLUTFIT
 */

const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { generateSign } = require("../../../utils/jwt");
const crypto = require("crypto");
const transporter = require("../../../utils/mailer");

// Definimos la base del frontend dinámicamente
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const register = async (req, res) => {
  try {
    const { name, lastname, email, age, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        errors: [
          { path: "email", message: "Este correo electrónico ya está en uso" },
        ],
      });
    }

    const newUser = new User({ name, lastname, email, age, password });
    await newUser.save();

    const token = generateSign(newUser._id);
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

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "El correo electrónico no está registrado" });
    }

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Buscamos al usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Por seguridad, devolvemos 200 aunque no exista el usuario
      return res.status(200).json({
        message:
          "Si el correo está registrado, recibirás un enlace de recuperación.",
      });
    }

    // 1. Generar Token único de seguridad
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Guardar token y expiración (1 hora)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // 3. Crear enlace dinámico
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // 4. Enviar Email con diseño profesional
    await transporter.sendMail({
      from: `"EvolutFit Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Recuperación de Contraseña - EvolutFit",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 15px; border: 1px solid #333; text-align: center;">
          <h1 style="color: #FFA500; letter-spacing: 2px;">EVOLUTFIT</h1>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
          <p style="font-size: 1.1rem;">Hola, <strong>${user.name}</strong>.</p>
          <p style="color: #aaa; line-height: 1.6;">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para configurar una nueva clave de acceso.</p>
          <div style="margin: 35px 0;">
            <a href="${resetUrl}" 
               style="background-color: #FFA500; color: #000000; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block; transition: background 0.3s;">
               RESTABLECER MI CONTRASEÑA
            </a>
          </div>
          <p style="font-size: 0.8rem; color: #666;">Este enlace expirará en 60 minutos por motivos de seguridad.</p>
          <p style="font-size: 0.8rem; color: #666;">Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
      `,
    });

    res
      .status(200)
      .json({ message: "Correo de recuperación enviado con éxito." });
  } catch (error) {
    console.error("🔥 Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace es inválido o ha expirado.",
      });
    }

    // Actualizar contraseña (el middleware pre-save del modelo se encarga del hash)
    user.password = password;

    // Limpiar campos de recuperación
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("🔥 Error en resetPassword:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};
const changePasswordProfile = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const userId = req.user._id; // Obtenido del middleware isAuth

    // 1. Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Verificar contraseña actual
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "La contraseña actual es incorrecta",
        status: "error",
      });
    }

    // 3. Actualizar con la nueva (el pre-save del modelo hará el hash)
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("🔥 Error en changePasswordProfile:", error);
    res.status(500).json({ message: "Error al actualizar la contraseña" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePasswordProfile,
};
