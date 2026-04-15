require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- Connect to MongoDB then start server ---
async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📡 POST /analyze ready`);
      logger.info(`❤️  GET /health ready`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
