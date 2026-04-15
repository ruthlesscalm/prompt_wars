const logger = require('../utils/logger');

const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Types of safe places to search for
const SAFE_PLACE_TYPES = ['hospital', 'police', 'convenience_store'];

/**
 * Fetch nearby safe places using Google Places API.
 * Searches for hospitals, police stations, and convenience stores.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 1500)
 * @returns {Promise<Array>} Array of nearby safe places
 */
async function fetchNearbyPlaces(lat, lng, radius = 1500) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'your_google_places_api_key_here') {
    logger.warn('Google Places API key not configured — returning mock data');
    return getMockPlaces(lat, lng);
  }

  try {
    const allPlaces = [];

    for (const type of SAFE_PLACE_TYPES) {
      const url = `${PLACES_BASE_URL}?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

      logger.debug(`Fetching places: type=${type}`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        logger.warn(`Places API returned status: ${data.status} for type: ${type}`);
        continue;
      }

      const places = (data.results || []).slice(0, 3).map((place) => ({
        name: place.name,
        type: type,
        address: place.vicinity || place.formatted_address || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      }));

      allPlaces.push(...places);
    }

    // Sort by distance
    allPlaces.sort((a, b) => a.distance - b.distance);

    logger.info(`Found ${allPlaces.length} nearby safe places`);
    return allPlaces;
  } catch (error) {
    logger.error('Failed to fetch nearby places:', error.message);
    return getMockPlaces(lat, lng);
  }
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula).
 * Returns distance in meters.
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Return mock places when API key is not available (for development/testing).
 */
function getMockPlaces(lat, lng) {
  logger.debug('Using mock places data');
  return [
    {
      name: 'City Hospital',
      type: 'hospital',
      address: '123 Health St',
      lat: lat + 0.002,
      lng: lng + 0.001,
      distance: 200,
    },
    {
      name: '24/7 Convenience Store',
      type: 'convenience_store',
      address: '45 Main Rd',
      lat: lat + 0.001,
      lng: lng - 0.001,
      distance: 100,
    },
    {
      name: 'Police Station',
      type: 'police',
      address: '78 Safety Ave',
      lat: lat - 0.003,
      lng: lng + 0.002,
      distance: 500,
    },
  ];
}

module.exports = { fetchNearbyPlaces };
