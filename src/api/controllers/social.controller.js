/**
 * SOCIAL & COMMUNITY CONTROLLER - EVOLUTFIT
 * Gestión de feed, interacciones atómicas y seguridad de recursos.
 */

const Social = require("../models/social.model");

/**
 * GET /api/v1/social
 * Obtención del feed con agregaciones optimizadas.
 */
const getSocialPosts = async (req, res) => {
  // Extraemos parámetros con valores por defecto
  const { sort, muscle, search, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  let query = {};

  // Filtros de búsqueda
  if (muscle) query.muscleGroups = muscle;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  try {
    // Definición del orden
    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "popular") sortQuery = { likesCount: -1 };

    // Ejecutamos en paralelo para mayor velocidad
    const [posts, totalCount] = await Promise.all([
      Social.aggregate([
        { $match: query },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1, lastname: 1, avatar: 1 } }],
            as: "author",
          },
        },
        { $unwind: "$author" },
      ]),
      Social.countDocuments(query),
    ]);

    // Devolvemos el mismo formato que el Leaderboard
    res.status(200).json({
      posts: posts, // Cambiado de 'records' a 'posts' para que sea semántico
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      totalPosts: totalCount,
      hasNextPage: skip + posts.length < totalCount,
    });
  } catch (error) {
    console.error("🔥 Error en getSocialPosts:", error);
    res.status(500).json({ message: "Error al obtener la comunidad" });
  }
};

/**
 * POST /api/v1/social
 * Crea una nueva publicación vinculada al token del usuario.
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
 * PATCH /api/v1/social/like/:id
 * Toggle de likes usando operaciones atómicas de MongoDB.
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
 * PUT /api/v1/social/:id
 * Actualización segura: Solo el autor puede editar.
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
 * DELETE /api/v1/social/:id
 * Eliminación segura basada en identidad.
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
