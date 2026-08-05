/**
 * VALIDADORES DE USUARIO - EVOLUTFIT
 *
 * Define los esquemas Zod para las rutas de autenticación y perfil.
 *
 * @decision Se define primero un `userValidatorSchema` maestro con todos los campos,
 *           y luego cada ruta usa `.shape`, `.omit()` y `.partial()` para reutilizar
 *           las reglas sin duplicar la lógica de validación.
 *           Ejemplo: el esquema de login reutiliza `email` y `password` del maestro
 *           con `userValidatorSchema.shape.email`.
 *
 * @decision `.lowercase()` en el campo email normaliza antes de validar, igual que
 *           el modelo de Mongoose (campo `lowercase: true`), para evitar que
 *           "Usuario@mail.com" y "usuario@mail.com" se traten como cuentas distintas.
 */

const { z } = require("zod");

/**
 * Esquema maestro de usuario con todos los campos posibles.
 * No se usa directamente en las rutas — sirve como fuente de campos
 * reutilizables para los esquemas específicos de cada endpoint.
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

/** Esquema para POST /api/auth/register — requiere todos los campos del maestro */
const registerValidatorSchema = z.object({
  body: z.object({
    name: userValidatorSchema.shape.name,
    lastname: userValidatorSchema.shape.lastname,
    age: userValidatorSchema.shape.age,
    email: userValidatorSchema.shape.email,
    password: userValidatorSchema.shape.password,
  }),
});

/** Esquema para POST /api/auth/login — solo email y contraseña */
const loginValidatorSchema = z.object({
  body: z.object({
    email: userValidatorSchema.shape.email,
    password: userValidatorSchema.shape.password,
  }),
});

/**
 * Esquema para PUT /api/users (actualización de perfil).
 * `.omit({ password, email })` excluye campos que tienen su propio endpoint dedicado.
 * `.partial()` hace todos los campos opcionales: el usuario puede actualizar solo el nombre
 * sin necesidad de enviar todos los demás campos.
 */
const updateValidatorSchema = z.object({
  body: userValidatorSchema.omit({ password: true, email: true }).partial(),
});

/** Esquema para PATCH /api/auth/change-password — requiere la contraseña actual y la nueva */
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    password: userValidatorSchema.shape.password,
  }),
});

module.exports = {
  userValidatorSchema, // El maestro por si lo necesitas
  registerValidatorSchema, // Para el POST /register
  loginValidatorSchema, // Para el POST /login
  updateValidatorSchema, // Para el PUT /profile
  changePasswordSchema, // Para el PATCH /change-password
};
