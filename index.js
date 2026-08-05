/**
 * MAIN SERVER ENTRY POINT - EVOLUTFIT
 * Carga variables de entorno, conecta a MongoDB e inicia el servidor.
 * La configuración de Express está en app.js para facilitar el testing.
 */

require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./app");

connectDB();

const PORT = process.env.PORT || 8080;
const isDev = process.env.NODE_ENV !== "production";

app.listen(PORT, "0.0.0.0", () => {
  const host = isDev ? `http://localhost:${PORT}` : "Production Server";
  console.log(`🚀 Server running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode`);
  console.log(`🔗 URL: ${host}`);
});
