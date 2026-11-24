/**
 * GeoJSON Point coordinate validation and normalization.
 * GeoJSON standard order is [longitude, latitude].
 */

function validateAndNormalizeCoordinates(input) {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  let parsed = input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('Coordinates must be valid GeoJSON or [longitude, latitude] array.');
    }
  }

  let coords = null;

  if (Array.isArray(parsed)) {
    coords = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (parsed.type && parsed.type !== 'Point') {
      throw new Error('GeoJSON type must be "Point".');
    }
    if (Array.isArray(parsed.coordinates)) {
      coords = parsed.coordinates;
    } else if (
      (parsed.latitude !== undefined || parsed.lat !== undefined) &&
      (parsed.longitude !== undefined || parsed.lng !== undefined)
    ) {
      const lat = parsed.latitude !== undefined ? parsed.latitude : parsed.lat;
      const lng = parsed.longitude !== undefined ? parsed.longitude : parsed.lng;
      coords = [lng, lat];
    } else {
      throw new Error('Invalid coordinate format. Expected { type: "Point", coordinates: [lng, lat] }.');
    }
  } else {
    throw new Error('Coordinates must be an array of [longitude, latitude] or a GeoJSON Point.');
  }

  if (!Array.isArray(coords) || coords.length !== 2) {
    throw new Error('Coordinates must be an array of exactly two numbers: [longitude, latitude].');
  }

  const rawLng = coords[0];
  const rawLat = coords[1];

  if (rawLng === null || rawLng === undefined || rawLat === null || rawLat === undefined) {
    throw new Error('Both longitude and latitude must be specified.');
  }

  const lng = Number(rawLng);
  const lat = Number(rawLat);

  if (!Number.isFinite(lng) || Number.isNaN(lng)) {
    throw new Error('Longitude must be a valid finite number.');
  }
  if (!Number.isFinite(lat) || Number.isNaN(lat)) {
    throw new Error('Latitude must be a valid finite number.');
  }

  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees.');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees.');
  }

  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

module.exports = {
  validateAndNormalizeCoordinates,
};
