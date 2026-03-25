/**
 * CONTROLADOR SOCIAL Y COMUNIDAD - EVOLUTFIT
 * Gestión del feed, interacciones (likes) y seguridad de recursos sociales.
 */

const Social = require("../models/social.model");

/**
 * Obtiene el feed de publicaciones con paginación, filtros y ordenación.
 * URL: GET /api/social?page=1&limit=10&sort=popular&muscle=Pecho&search=sentadilla
 *
 * @decision Se usa un pipeline de agregación en lugar de `.find()` porque
 *           la ordenación por popularidad (`sort=popular`) requiere calcular
 *           `likesCount` como campo derivado (`$size` del array `likes`) antes
 *           de poder ordenar por él. Con `.find()` eso no es posible.
 *
 * @decision `$addFields: { likesCount: { $size: "$likes" } }` calcula el contador
 *           en la consulta misma, evitando traer todos los documentos a Node.js
 *           para calcular el tamaño del array allí.
 *
 * @decision La búsqueda por texto usa `$regex` con `$options: "i"` (case-insensitive)
 *           sobre título, contenido y grupos musculares. Para producción con
 *           colecciones grandes sería mejor un índice de texto (`$text / $search`).
 *
 * @decision `Promise.all` ejecuta el pipeline y el `countDocuments` en paralelo,
 *           reduciendo la latencia de la respuesta frente a dos queries secuenciales.
 *
 * @decision `$lookup` con sub-pipeline `$project` trae solo los campos del autor
 *           que necesita el frontend (name, lastname, avatar), evitando exponer
 *           datos sensibles como el email o el hash de contraseña.
 *
 * @param {import('express').Request} req - Query: page, limit, sort, muscle, search
 * @param {import('express').Response} res
 */
const getSocialPosts = async (req, res) => {
  const { sort, muscle, search } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let query = {};

  if (muscle) query.muscleGroups = muscle;

  if (search) {
    // $or permite buscar el término en varios campos simultáneamente
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { muscleGroups: { $regex: search, $options: "i" } },
    ];
  }

  try {
    // Ordenación por defecto: más reciente primero
    let sortQuery = { createdAt: -1 };
    // Los strings de sort coinciden con los valores que envía el frontend
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    // "popular" ordena por likesCount, que se calcula como campo derivado en el pipeline
    if (sort === "popular") sortQuery = { likesCount: -1 };

    const postsPipeline = [
      { $match: query },
      // Calculamos likesCount como tamaño del array para poder ordenar por él
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        // Unimos con la colección 'users' para obtener los datos del autor
        // Solo traemos los campos necesarios para el frontend (evita exponer datos sensibles)
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, lastname: 1, avatar: 1 } }],
          as: "author",
        },
      },
      // $unwind convierte el array 'author' (de 1 elemento) en un objeto directo
      { $unwind: "$author" },
    ];

    // Ejecutamos pipeline y conteo en paralelo para reducir latencia
    const [posts, totalPosts] = await Promise.all([
      Social.aggregate(postsPipeline),
      Social.countDocuments(query),
    ]);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
      hasNextPage: page * limit < totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la comunidad" });
  }
};

/**
 * Crea una nueva publicación en el feed de la comunidad.
 * URL: POST /api/social
 *
 * @decision El `userId` se extrae del token (req.user._id), no del body,
 *           para garantizar que el autor siempre es el usuario autenticado.
 *
 * @param {import('express').Request} req - Body: title, content, muscleGroups
 * @param {import('express').Response} res
 */
const createPost = async (req, res) => {
  try {
    const { title, content, muscleGroups } = req.body;

    const newPost = new Social({
      userId: req.user._id,
      title,
      content,
      muscleGroups,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al publicar", error: error.message });
  }
};

/**
 * Alterna el like de un usuario sobre una publicación (toggle).
 * URL: PATCH /api/social/like/:id
 *
 * @decision Se hace en dos pasos intencionales: primero verificar si el usuario
 *           ya dio like (`findOne`) y luego aplicar `$pull` o `$addToSet` según
 *           corresponda. Esto es más legible que un `$cond` dentro del update.
 *
 * @decision `$addToSet` garantiza que un usuario no pueda añadir su ID dos veces
 *           al array, incluso si hay condiciones de carrera (race condition).
 *           `$pull` lo elimina si ya estaba. Ambas son operaciones atómicas de MongoDB.
 *
 * @param {import('express').Request} req - Params: id (ObjectId del post)
 * @param {import('express').Response} res
 */
const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    // Verificamos si el usuario ya existe en el array de likes de ese post
    const postRecord = await Social.findOne({ _id: id, likes: userId });

    // Si ya existe -> $pull (quitar). Si no existe -> $addToSet (agregar sin duplicar).
    const updateAction = postRecord
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Social.findByIdAndUpdate(id, updateAction, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    res.status(200).json({
      likes: updatedPost.likes.length,
      isLiked: !postRecord, // Si no existía el registro previo, ahora es true
    });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la interacción" });
  }
};

/**
 * Actualiza el contenido de una publicación existente.
 * URL: PUT /api/social/:id
 *
 * @decision El filtro `{ _id: id, userId }` garantiza que solo el autor
 *           puede editar su publicación. Si el ID pertenece a otro usuario,
 *           `findOneAndUpdate` devuelve null y se responde con 404.
 *
 * @decision Se desestructura el body (title, content, muscleGroups) en lugar
 *           de usar `$set: req.body`, para evitar que el cliente pueda
 *           inyectar campos sensibles como `userId` o `likes`.
 *
 * @param {import('express').Request} req - Params: id. Body: title, content, muscleGroups
 * @param {import('express').Response} res
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Desestructuración para evitar inyección de campos sensibles (como userId o likes)
    const { title, content, muscleGroups } = req.body;

    const updatedPost = await Social.findOneAndUpdate(
      { _id: id, userId: userId }, // El filtro garantiza propiedad
      { $set: { title, content, muscleGroups } },
      { new: true, runValidators: true },
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post no encontrado o no tienes permisos para editarlo",
      });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el post" });
  }
};

/**
 * Elimina una publicación del feed.
 * URL: DELETE /api/social/:id
 *
 * @decision `findOneAndDelete` con filtro compuesto `{ _id, userId }` verifica
 *           la propiedad y borra en una sola operación atómica, evitando
 *           que un usuario pueda eliminar publicaciones ajenas.
 *
 * @param {import('express').Request} req - Params: id (ObjectId del post)
 * @param {import('express').Response} res
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedPost = await Social.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!deletedPost) {
      return res.status(404).json({
        message: "No se pudo eliminar: El post no existe o no eres el autor",
      });
    }

    res.status(200).json({ message: "Post eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el post" });
  }
};

module.exports = {
  getSocialPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};
