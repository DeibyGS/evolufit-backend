/**
 * AUTH HELPER - TEST SUITE
 * Utilidades para crear usuarios y tokens JWT en tests de rutas protegidas.
 */

const User = require("../../src/api/models/User.model");
const { generateSign } = require("../../utils/jwt");

/**
 * Crea un usuario de prueba en la BD en memoria y devuelve su token JWT.
 * Usar en beforeEach de tests de rutas protegidas.
 */
const createTestUserAndToken = async (overrides = {}) => {
  const userData = {
    name: "Test",
    lastname: "User",
    email: "test@evolufit.com",
    age: 25,
    password: "password123",
    ...overrides,
  };

  const user = new User(userData);
  await user.save();

  const token = generateSign(user._id);
  return { user, token };
};

module.exports = { createTestUserAndToken };
