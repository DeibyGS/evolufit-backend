const { z } = require("zod");

/**
 * VALIDADOR DE USUARIOS - EVOLUTFIT
 * Coherencia visual y técnica con el sistema de validación global.
 */
const userValidatorSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto",
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),

  lastname: z
    .string({
      required_error: "El apellido es obligatorio",
      invalid_type_error: "El apellido debe ser una cadena de texto",
    })
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido es demasiado largo"),

  age: z.coerce
    .number({
      required_error: "La edad es obligatoria",
      invalid_type_error: "La edad debe ser un número",
    })
    .int("La edad debe ser un número entero")
    .min(14, "Debes tener al menos 14 años para registrarte")
    .max(100, "La edad ingresada no es válida"),

  email: z
    .string({
      required_error: "El correo electrónico es obligatorio",
    })
    .trim()
    .lowercase()
    .email("Formato de correo electrónico inválido"),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
    })
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),
});

// 2. Esquema de Login (Reutiliza email y password del maestro)
const loginValidatorSchema = z.object({
  email: userValidatorSchema.shape.email,
  password: userValidatorSchema.shape.password,
});

// 3. Esquema de Actualización de Perfil (Omitimos password por seguridad)
const updateValidatorSchema = userValidatorSchema
  .omit({ password: true })
  .partial();

// 4. Esquema de Cambio de Contraseña
const changePasswordSchema = z.object({
  oldPassword: userValidatorSchema.shape.password,
  password: userValidatorSchema.shape.password,
});

module.exports = {
  userValidatorSchema,
  loginValidatorSchema,
  updateValidatorSchema,
  changePasswordSchema,
};
