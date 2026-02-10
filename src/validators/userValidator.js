const { z } = require("zod");

/**
 * ESQUEMA MAESTRO (Base de datos)
 * Lo mantenemos limpio para usar sus formas (.shape)
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

// 1. Esquema de Registro (Nuevo: Envolviendo el maestro en 'body')
const registerValidatorSchema = z.object({
  body: userValidatorSchema,
});

// 2. Esquema de Login (Ya lo tenías bien wrapped)
const loginValidatorSchema = z.object({
  body: z.object({
    email: userValidatorSchema.shape.email,
    password: userValidatorSchema.shape.password,
  }),
});

// 3. Esquema de Actualización (Corregido: Ahora envuelve el parcial en 'body')
const updateValidatorSchema = z.object({
  body: userValidatorSchema.omit({ password: true, email: true }).partial(),
});

// 4. Esquema de Cambio de Contraseña (Mantenemos tu versión corregida)
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    password: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  }),
});

module.exports = {
  userValidatorSchema, // El maestro por si lo necesitas
  registerValidatorSchema, // Para el POST /register
  loginValidatorSchema, // Para el POST /login
  updateValidatorSchema, // Para el PUT /profile
  changePasswordSchema, // Para el PATCH /change-password
};
