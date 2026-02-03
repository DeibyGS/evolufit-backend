const { z } = require("zod");

// 1. Esquema Maestro (Registro)
const userValidatorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50),
  lastname: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  age: z.coerce.number().min(14, "Mínimo 14 años").max(100, "Edad no válida"),
  email: z.string().trim().lowercase().email("Formato de correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// 2. Login (Derivado)
const loginValidatorSchema = userValidatorSchema.pick({
  email: true,
  password: true,
});

// 3. Update Perfil (Derivado - Campos opcionales)
const updateValidatorSchema = userValidatorSchema
  .omit({ password: true })
  .partial();

// 4. Cambio de Contraseña (Específico)
const changePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  // Aquí podrías añadir confirmPassword si quisieras validarlo en el backend
});

module.exports = {
  userValidatorSchema,
  loginValidatorSchema,
  updateValidatorSchema,
  changePasswordSchema,
};
