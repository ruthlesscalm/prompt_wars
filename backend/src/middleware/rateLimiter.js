/**
 * Rate limiting middleware for API endpoints
 * Prevents abuse and DOS attacks
 * Enterprise-grade security pattern
 */

// Note: Requires 'express-rate-limit' package
// Add to package.json: "express-rate-limit": "^7.1.5"

let rateLimit;
try {
  rateLimit = require("express-rate-limit");
} catch (error) {
  console.warn(
    "express-rate-limit not installed. Install with: npm install express-rate-limit",
  );
  // Fallback no-op middleware if package not installed
  rateLimit = null;
}

const logger = require("../utils/logger");

/**
 * Create a rate limiter with custom configuration
 * Limits: 100 requests per 15 minutes per IP
 */
const createLimiter = () => {
  if (!rateLimit) {
    logger.warn("Rate limiting disabled - express-rate-limit not installed");
    return (req, res, next) => next(); // Pass-through middleware
  }

  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100, // Limit each IP to 100 requests per windowMs

    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers

    // Key generator for proxy support (e.g., AWS load balancers)
    keyGenerator: (req, res) => {
      return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    },

    // Skip rate limiting for health checks (optional)
    skip: (req) => {
      return req.path === "/health";
    },

    // Custom message handler
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message:
          "Too many requests. Maximum 100 requests per 15 minutes allowed.",
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });
};

/**
 * Stricter limiter for critical endpoints
 * Limits: 20 requests per minute (for /analyze endpoint)
 */
const createStrictLimiter = () => {
  if (!rateLimit) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1-minute window
    max: 20, // Limit to 20 requests per minute
    message: "Too many analysis requests. Please try again in 1 minute.",
    keyGenerator: (req) => {
      return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    },
    handler: (req, res) => {
      logger.warn(`Strict rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message:
          "Rate limit exceeded. Max 20 requests per minute for /analyze endpoint.",
      });
    },
  });
};

module.exports = {
  limiter: createLimiter(),
  strictLimiter: createStrictLimiter(),
};
