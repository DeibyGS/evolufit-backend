import { z } from "zod";

export const healthValidatorSchema = z.object({
  // Permitimos decimales para mayor precisión en el progreso
  weight: z.coerce
    .number()
    .min(20, "El peso debe ser realista (mínimo 20kg)")
    .max(300, "El peso excede el límite permitido"),

  height: z.coerce
    .number()
    .int("La altura debe ser un número entero (cm)")
    .min(100, "La altura mínima es 100 cm")
    .max(250, "La altura máxima es 250 cm"),

  age: z.coerce
    .number()
    .int("La edad debe ser un número entero")
    .min(15, "Debes tener al menos 15 años para usar la calculadora"),

  gender: z.enum(["hombre", "mujer"], {
    errorMap: () => ({ message: "El género debe ser 'hombre' o 'mujer'" }),
  }),

  // Quitamos .int() porque usas factores como 1.375 o 1.55
  activity: z.coerce
    .number()
    .min(1.2, "El nivel de actividad mínimo es 1.2")
    .max(2.5, "El nivel de actividad es demasiado alto"),

  // Estos campos son calculados, solo validamos que sean números
  imc: z.coerce.number(),
  tmb: z.coerce.number(),
  tdee: z.coerce.number(),
});
