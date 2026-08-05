/**
 * CONTROLADOR DE AUTENTICACIÓN - EVOLUTFIT
 * Gestiona el registro, login y recuperación/cambio de contraseña.
 */

const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { generateSign } = require("../../../utils/jwt");
const crypto = require("crypto");
const transporter = require("../../../utils/mailer");

// La URL base del frontend se lee desde variables de entorno para que funcione
// tanto en local (localhost:5173) como en el entorno de producción (Vercel).
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Registra un nuevo usuario en la plataforma.
 *
 * @decision El hash de la contraseña lo ejecuta el middleware pre("save") del modelo User,
 *           no este controller. Por eso se pasa la contraseña en plano a `new User(...)`.
 *
 * @decision Se devuelve el token JWT en la respuesta para que el frontend pueda
 *           iniciar sesión automáticamente tras el registro sin un segundo round-trip.
 *
 * @caso_borde Si el email ya existe se devuelve 409 con estructura de error
 *             compatible con la capa de validación Zod del frontend (campo `path`).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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

    // Convertimos a objeto plano para poder eliminar la contraseña hasheada
    // antes de enviarla al cliente. No se puede borrar directamente del documento Mongoose.
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

/**
 * Autentica a un usuario existente y devuelve un token JWT.
 *
 * @decision Se distingue entre "email no registrado" (404) y "contraseña incorrecta" (401)
 *           para ofrecer mensajes claros al usuario. En algunos sistemas se unifica
 *           en un 401 genérico por seguridad, pero aquí se prioriza la UX.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "El correo electrónico no está registrado" });
    }

    // bcrypt.compare compara el texto plano con el hash almacenado en BD.
    // Nunca se deshashea; bcrypt rehashea el input y compara.
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

/**
 * Inicia el flujo de recuperación de contraseña enviando un email con token único.
 *
 * @decision Aunque el usuario no exista, se devuelve siempre 200 con el mismo mensaje.
 *           Esto es una práctica de seguridad estándar: evita que un atacante pueda
 *           enumerar qué emails están registrados en la plataforma (user enumeration attack).
 *
 * @decision El token se genera con `crypto.randomBytes` (criptográficamente seguro)
 *           en lugar de un UUID simple, y se almacena en el documento del usuario
 *           junto con su fecha de expiración (1 hora).
 *
 * @caso_borde Si el servidor de email falla, el error se captura en el catch y
 *             se devuelve 500. El token queda guardado en BD pero sin usarse.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Respuesta genérica intencionada para no revelar si el email existe
      return res.status(200).json({
        message:
          "Si el correo está registrado, recibirás un enlace de recuperación.",
      });
    }

    // Token de 32 bytes aleatorios convertido a hex = 64 caracteres.
    // Es suficientemente largo para ser impredecible por fuerza bruta.
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    // Date.now() + 3600000ms = expira en exactamente 1 hora
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // El enlace lleva el token en la URL para que el frontend lo capture
    // y lo reenvíe al endpoint POST /auth/reset-password/:token
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

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

/**
 * Completa el flujo de recuperación: valida el token y actualiza la contraseña.
 *
 * @decision La búsqueda filtra simultáneamente por token Y por fecha de expiración
 *           (`$gt: Date.now()`). Si el token ha expirado, el documento no se encuentra
 *           y se devuelve 400, sin necesidad de dos consultas separadas.
 *
 * @decision Tras el cambio, se limpian `resetPasswordToken` y `resetPasswordExpires`
 *           del documento (asignando `undefined`). Esto invalida el enlace de forma
 *           inmediata, evitando reutilizaciones del mismo token.
 *
 * @decision La nueva contraseña se asigna en plano y el middleware pre("save") del modelo
 *           se encarga del hash. No se llama a bcrypt directamente aquí.
 *
 * @param {import('express').Request} req - Debe contener `token` en params y `password` en body.
 * @param {import('express').Response} res
 */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Búsqueda combinada: el token debe existir Y no haber expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace es inválido o ha expirado.",
      });
    }

    // El middleware pre("save") del modelo User hashea automáticamente 'password'
    user.password = password;

    // Limpiamos los campos de recuperación para invalidar el token usado
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

/**
 * Permite al usuario autenticado cambiar su contraseña desde el perfil.
 *
 * A diferencia de `resetPassword`, este flujo requiere que el usuario
 * conozca su contraseña actual, lo que previene cambios no autorizados
 * si la sesión está activa en un dispositivo ajeno.
 *
 * @decision Se usa `bcrypt.compare` para verificar la contraseña actual antes
 *           de permitir el cambio, y luego se delega el hash al pre("save") del modelo.
 *
 * @param {import('express').Request} req - `req.user._id` inyectado por el middleware isAuth.
 * @param {import('express').Response} res
 */
const changePasswordProfile = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const userId = req.user._id; // Inyectado por el middleware isAuth tras validar el JWT

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificamos que la contraseña actual enviada coincide con el hash en BD
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "La contraseña actual es incorrecta",
        status: "error",
      });
    }

    // Asignamos en plano; el pre("save") del modelo hashea antes de persistir
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
