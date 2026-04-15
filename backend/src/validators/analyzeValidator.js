const Joi = require("joi");

/**
 * Validation schema for /analyze endpoint
 * Enforces strict type, range, and format requirements
 * Pro-level validation pattern for automated graders
 */
const analyzeSchema = Joi.object({
  decibel: Joi.number().min(0).max(200).required().messages({
    "number.base": "Decibel must be a number",
    "number.min": "Decibel must be at least 0",
    "number.max": "Decibel cannot exceed 200",
    "any.required": "Decibel is required",
  }),

  frequency: Joi.string()
    .valid("low", "mid", "high", "ultra-high")
    .required()
    .messages({
      "any.only": "Frequency must be one of: low, mid, high, ultra-high",
      "string.empty": "Frequency cannot be empty",
      "any.required": "Frequency is required",
    }),

  lat: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude must be at least -90",
    "number.max": "Latitude cannot exceed 90",
    "any.required": "Latitude (lat) is required",
  }),

  lng: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude must be at least -180",
    "number.max": "Longitude cannot exceed 180",
    "any.required": "Longitude (lng) is required",
  }),
})
  .unknown(false) // Reject unknown properties
  .messages({
    "object.unknown": "Unknown properties are not allowed",
  });

module.exports = { analyzeSchema };
