/**
 * VALIDADOR SOCIAL - EVOLUTFIT
 *
 * Define los esquemas Zod para las rutas del módulo de comunidad.
 * Cada esquema valida una sección específica del request (body, params o query).
 *
 * @decision `postIdParamSchema` valida el formato del ID con regex de ObjectId MongoDB
 *           (`/^[0-9a-fA-F]{24}$/`) en lugar de dejarlo pasar y que Mongoose lance
 *           un CastError. Así el error llega al cliente como 400 (validación)
 *           y no como 500 (error interno del servidor).
 *
 * @decision `updatePostSchema` se construye con `.merge()` combinando la validación
 *           del ID en params y del body de creación, reutilizando esquemas ya definidos.
 */

const { z } = require("zod");
const { MUSCLE_GROUPS } = require("../constants/exerciseList");

/** Valida que `req.params.id` tenga formato válido de ObjectId de MongoDB (24 hex). */
const postIdParamSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: "El ID de la publicación es obligatorio" })
      .regex(/^[0-9a-fA-F]{24}$/, "El formato del ID no es válido"),
  }),
});

/** Valida el body para crear una nueva publicación (POST /api/social). */
const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "El título es obligatorio",
        invalid_type_error: "El título debe ser un texto",
      })
      .trim()
      .min(5, "El título debe tener al menos 5 caracteres")
      .max(100, "El título es demasiado largo"),

    content: z
      .string({
        required_error: "La descripción es obligatoria",
        invalid_type_error: "La descripción debe ser un texto",
      })
      .trim()
      .min(10, "La descripción debe ser más detallada (min. 10 caracteres)")
      .max(2000, "La descripción excede el límite de caracteres"),

    muscleGroups: z
      .array(
        z.enum(MUSCLE_GROUPS, {
          invalid_type_error: "Uno o más grupos musculares no son válidos",
        }),
        { required_error: "Debes seleccionar al menos un grupo muscular" },
      )
      .min(1, "Debes seleccionar al menos un grupo muscular")
      .max(5, "No puedes asignar más de 5 grupos musculares por post"),
  }),
});

/**
 * Valida los parámetros de filtrado del feed (GET /api/social).
 * Los valores de `sort` coinciden con los strings que envía el frontend
 * ('recent', 'popular', 'oldest').
 */
const filterPostSchema = z.object({
  query: z.object({
    sort: z
      .enum(["recent", "popular", "oldest"], {
        invalid_type_error: "El tipo de ordenamiento no es válido",
      })
      .default("recent"),

    muscle: z
      .enum(MUSCLE_GROUPS, {
        invalid_type_error: "El filtro de grupo muscular no es válido",
      })
      .optional(),

    search: z
      .string({ invalid_type_error: "La búsqueda debe ser un texto" })
      .trim()
      .max(50, "El término de búsqueda es demasiado largo")
      .optional(),

    page: z.coerce
      .number({ invalid_type_error: "La página debe ser un número" })
      .int()
      .positive()
      .optional()
      .default(1),

    limit: z.coerce
      .number({ invalid_type_error: "El límite debe ser un número" })
      .int()
      .positive()
      .max(100, "No puedes solicitar más de 100 posts por página")
      .optional()
      .default(10),
  }),
});

/**
 * Esquema combinado para actualizar un post (PUT /api/social/:id).
 * Valida simultáneamente el ID en params y el body con los mismos campos que la creación.
 * Zod `.merge()` combina dos esquemas en uno sin duplicar lógica.
 */
const updatePostSchema = postIdParamSchema.merge(createPostSchema);

module.exports = {
  postIdParamSchema,
  createPostSchema,
  filterPostSchema,
  updatePostSchema,
};
