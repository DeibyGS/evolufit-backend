/**
 * RM & LEADERBOARD ROUTER - EVOLUTFIT
 * Definición de endpoints para el registro de marcas personales y acceso al ranking global.
 */
const { rmValidatorSchema } = require("../../validators/rmValidator");
const validate = require("../../../utils/validate");
const { isAuth } = require("../../middlewares/auth");
const {
  saveRM,
  getMyRMs,
  deleteRM,
  getLeaderboard,
} = require("../controllers/rm.controller");

// Inicialización del router de Express
const rmRouter = require("express").Router();

rmRouter.get("/leaderboard", isAuth, getLeaderboard);
rmRouter.get("/", isAuth, getMyRMs);

// 2. RUTAS CON PARÁMETROS (Mejor abajo)
rmRouter.post("/", isAuth, validate(rmValidatorSchema), saveRM);
rmRouter.delete("/:id", isAuth, deleteRM);

/**
 * Exportación del router para su integración en la API central.
 */
module.exports = rmRouter;
