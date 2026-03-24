/**
 * DB HELPER - TEST SUITE
 * Levanta un MongoDB en memoria para tests de integración.
 * Cada test suite hace connect() en beforeAll y disconnect() en afterAll.
 * clearDatabase() se usa en afterEach para aislar los tests.
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

/**
 * Inicia MongoDB en memoria y conecta Mongoose.
 */
const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

/**
 * Elimina la base de datos, cierra la conexión y para el servidor en memoria.
 */
const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Limpia todas las colecciones entre tests para evitar contaminación de datos.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, disconnect, clearDatabase };
