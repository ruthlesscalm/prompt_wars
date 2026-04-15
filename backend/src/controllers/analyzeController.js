const { analyzeEnvironment } = require("../services/safetyService");
const { analyzeSchema } = require("../validators/analyzeValidator");
const logger = require("../utils/logger");

/**
 * POST /analyze
 * Accept audio + location data and return safety analysis.
 *
 * Body: { decibel: number, frequency: string, lat: number, lng: number }
 * Response: { threat: boolean, action: string, places: array }
 */
async function handleAnalyze(req, res, next) {
  try {
    // --- Input validation with Joi schema ---
    const { error, value } = analyzeSchema.validate(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      logger.warn("Validation failed:", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const { decibel, frequency, lat, lng } = value;

    // --- Run the safety analysis pipeline ---
    const result = await analyzeEnvironment({ decibel, frequency, lat, lng });

    return res.status(200).json({
      success: true,
      threat: result.threat,
      action: result.action,
      places: result.places,
      incidentId: result.incidentId,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { handleAnalyze };
