const express = require("express");
const { handleAnalyze } = require("../controllers/analyzeController");
const { strictLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply strict rate limiting to /analyze endpoint
// Limit: 20 requests per minute per IP
router.use(strictLimiter);

// POST /analyze — Main safety analysis endpoint
router.post("/", handleAnalyze);

module.exports = router;
