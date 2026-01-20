/**
 * SOCIAL & COMMUNITY CONTROLLER - EVOLUTFIT
 * Gestiona el feed de rutinas compartidas, interacciones (likes) y filtrado dinámico.
 */

const Social = require("../models/social.model");

/**
 * Obtención del feed social con soporte para filtros y búsqueda.
 * Implementa una arquitectura de consulta flexible (Query Building).
 */
const getSocialPosts = async (req, res) => {
  const { sort, muscle, search } = req.query;
  let query = {};

  // 1. Filtrado por grupo muscular
  if (muscle) query.muscleGroups = muscle;

  // 2. Motor de búsqueda por texto (Case-Insensitive) en título y contenido
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  try {
    // 3. Lógica de ordenamiento dinámica (Recientes, Antiguos, Populares)
    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "popular") sortQuery = { likesCount: -1 };

    // 4. Pipeline de Agregación para procesar el Feed
    const posts = await Social.aggregate([
      { $match: query }, // Filtro inicial

      // Añade el campo calculado likesCount basado en el tamaño del array 'likes'
      { $addFields: { likesCount: { $size: "$likes" } } },

      { $sort: sortQuery }, // Aplicación del orden elegido

      // Join con la colección de usuarios para obtener datos del creador
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },

      { $unwind: "$author" }, // Aplana el array del lookup a un objeto directo

      // Proyección selectiva: Exclusión estricta de datos sensibles del autor
      {
        $project: {
          "author.password": 0,
          "author.email": 0,
          "author.isActive": 0,
          "author.createdAt": 0,
          "author.updatedAt": 0,
        },
      },
    ]).limit(50); // Límite preventivo de registros para optimizar el ancho de banda

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la comunidad" });
  }
};

/**
 * Publicación de una nueva rutina o post en la comunidad.
 */
const createPost = async (req, res) => {
  try {
    const { title, content, muscleGroups } = req.body;

    // Vinculación automática con el usuario autenticado (inyectado por isAuth middleware)
    const newPost = new Social({
      userId: req.user._id,
      title,
      content,
      muscleGroups,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: "Error al publicar" });
  }
};

/**
 * Lógica de interacción Toggle (Like/Unlike).
 * Gestiona atómicamente el array de IDs de usuarios interesados en el post.
 */
const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const post = await Social.findById(id);
    if (!post) return res.status(404).json({ message: "Rutina no encontrada" });

    // Verificación de existencia del ID de usuario en el array de likes
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // Caso 1: Añadir Like (Interés)
      post.likes.push(userId);
    } else {
      // Caso 2: Quitar Like (Desinterés)
      post.likes.splice(index, 1);
    }

    await post.save();

    // Devuelve el nuevo conteo y el estado para actualización reactiva en el Frontend
    res.status(200).json({
      likes: post.likes.length,
      isLiked: index === -1,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  getSocialPosts,
  createPost,
  toggleLike,
};
