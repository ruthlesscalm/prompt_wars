/**
 * Environment configuration with validation
 * Ensures all required variables are present at startup
 * Prevents silent failures from missing config
 */

const logger = require("../utils/logger");

/**
 * Validate and load environment variables
 * Throws error if required variables are missing
 *
 * @returns {Object} Validated environment configuration
 */
function validateEnv() {
  const required = ["MONGO_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `❌ Missing required environment variables: ${missing.join(", ")}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  return {
    // Server
    PORT: parseInt(process.env.PORT, 10) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

    // Database
    MONGO_URI: process.env.MONGO_URI,

    // Google APIs
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || null,

    // Safety parameters
    DECIBEL_THRESHOLD: parseInt(process.env.DECIBEL_THRESHOLD, 10) || 80,

    // Derived settings
    isDevelopment: process.env.NODE_ENV !== "production",
    isProduction: process.env.NODE_ENV === "production",
  };
}

// Single instance export
let config = null;

/**
 * Get validated configuration
 * Lazily initializes on first call
 *
 * @returns {Object} Configuration object
 */
function getConfig() {
  if (!config) {
    config = validateEnv();
    logger.info(`✅ Environment validated (${config.NODE_ENV} mode)`);
  }
  return config;
}

module.exports = {
  validateEnv,
  getConfig,
};
