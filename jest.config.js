/**
 * JEST CONFIG - EVOLUTFIT BACKEND
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/constants/**",
    "!src/config/**",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
