const logger = require('../utils/logger');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Ask Gemini for a 3-word safety instruction based on context.
 *
 * @param {number} decibel - Noise level in dB
 * @param {string} frequency - Frequency description (e.g., "high", "low")
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Array} places - Nearby safe places
 * @returns {Promise<string>} 3-word safety instruction
 */
async function getSafetyInstruction(decibel, frequency, lat, lng, places) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    logger.warn('Gemini API key not configured — returning fallback instruction');
    return getFallbackInstruction(places);
  }

  try {
    // Build the places list for the prompt
    const placesList = places
      .slice(0, 5)
      .map((p, i) => `${i + 1}. ${p.name} (${p.type}, ${p.distance}m away)`)
      .join('\n');

    const prompt = `User is at [${lat}, ${lng}].
Noise level: ${decibel} dB, ${frequency}-pitch anomaly detected.
Nearby safe locations:
${placesList}

Which location is safest to go to right now? Reply in exactly 3 words only. Example: "Go to hospital"`;

    logger.debug('Sending prompt to Gemini');

    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 20,
          temperature: 0.1,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      logger.error('Gemini API error:', data.error.message);
      return getFallbackInstruction(places);
    }

    // Extract the text from Gemini's response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      logger.warn('Empty response from Gemini');
      return getFallbackInstruction(places);
    }

    logger.info(`Gemini response: "${text}"`);
    return text;
  } catch (error) {
    logger.error('Gemini service failed:', error.message);
    return getFallbackInstruction(places);
  }
}

/**
 * Generate a fallback instruction when Gemini is unavailable.
 * Picks the closest safe place.
 */
function getFallbackInstruction(places) {
  if (!places || places.length === 0) {
    return 'Stay alert now';
  }

  // Pick the closest place
  const closest = places[0];
  const typeMap = {
    hospital: 'Go to hospital',
    police: 'Go to police',
    convenience_store: 'Go to store',
  };

  return typeMap[closest.type] || `Go to ${closest.name.split(' ')[0].toLowerCase()}`;
}

module.exports = { getSafetyInstruction };
