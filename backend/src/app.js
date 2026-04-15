const express = require("express");
const cookieParser = require("cookie-parser");
const analyzeRoutes = require("./routes/analyzeRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Core middleware ---
app.use(express.json());
app.use(cookieParser());

// --- CORS with Origin Whitelist ---
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Only set CORS header if origin is whitelisted
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use("/analyze", analyzeRoutes);

// --- Global error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
