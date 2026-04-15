const { fetchNearbyPlaces } = require('./placesService');
const { getSafetyInstruction } = require('./geminiService');
const IncidentLog = require('../models/IncidentLog');
const logger = require('../utils/logger');

/**
 * Main safety analysis pipeline.
 * 1. Check if decibel exceeds threshold → mark as threat
 * 2. If threat → fetch nearby safe places
 * 3. If threat → ask Gemini for a safety instruction
 * 4. Log the incident to MongoDB
 * 5. Return structured response
 *
 * @param {Object} data - { decibel, frequency, lat, lng }
 * @returns {Promise<Object>} { threat, action, places }
 */
async function analyzeEnvironment(data) {
  const { decibel, frequency, lat, lng } = data;
  const threshold = parseInt(process.env.DECIBEL_THRESHOLD, 10) || 80;

  logger.info(`Analyzing: decibel=${decibel}, frequency=${frequency}, lat=${lat}, lng=${lng}`);

  const isThreat = decibel > threshold;

  let places = [];
  let action = 'Environment is safe';

  if (isThreat) {
    logger.warn(`⚠️  Threat detected! ${decibel} dB exceeds threshold of ${threshold} dB`);

    // Step 1: Fetch nearby safe places
    places = await fetchNearbyPlaces(lat, lng);

    // Step 2: Get AI safety instruction
    action = await getSafetyInstruction(decibel, frequency, lat, lng, places);
  } else {
    logger.info(`✅ No threat. ${decibel} dB is below threshold of ${threshold} dB`);
  }

  // Step 3: Log incident to database
  const incident = await logIncident({
    lat,
    lng,
    decibel,
    frequency,
    threat: isThreat,
    action,
    resolution: isThreat ? action : 'no_threat',
  });

  logger.info(`Incident logged: ${incident._id}`);

  return {
    threat: isThreat,
    action,
    places,
    incidentId: incident._id,
  };
}

/**
 * Save an incident to MongoDB.
 */
async function logIncident(data) {
  try {
    const log = new IncidentLog(data);
    const saved = await log.save();
    return saved;
  } catch (error) {
    logger.error('Failed to save incident log:', error.message);
    // Return a minimal object so the pipeline doesn't break
    return { _id: 'unsaved', ...data };
  }
}

module.exports = { analyzeEnvironment };
