/**
 * VITEST CONFIG - EVOLUTFIT BACKEND
 *
 * Migración de Jest → Vitest para tests de integración del backend.
 *
 * @decision Se usa `globals: true` para que describe/it/expect/vi estén disponibles
 *           globalmente sin imports, manteniendo la misma sintaxis que los archivos
 *           de test existentes (evita reescribir todos los tests).
 *
 * @decision Se usa `environment: 'node'` porque los tests corren contra la API Express
 *           y MongoDB en memoria — no necesitan JSDOM ni entorno de navegador.
 *
 * @decision El coverage provider es 'v8' (motor nativo de Node.js) en lugar de Istanbul
 *           porque no requiere instrumentación extra del código fuente.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Entorno de ejecución: Node.js puro (sin DOM)
    environment: "node",

    // Globals: describe/it/expect/vi disponibles sin import en cada archivo
    globals: true,

    // Patrón de archivos de test (equivalente al testMatch de Jest)
    include: ["**/tests/**/*.test.js"],

    // Timeout por test (aumentado para operaciones con MongoDB en memoria)
    testTimeout: 30000,

    // Configuración de cobertura de código
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/constants/**", "src/config/**"],
      thresholds: {
        lines: 80, // Mínimo 80% de cobertura de líneas
      },
    },
  },
});
