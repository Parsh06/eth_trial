/**
 * Distance calculation utilities for location-based features
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in meters
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Format distance for display
 * @param distanceInMeters Distance in meters
 * @returns Formatted distance string
 */
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else if (distanceInMeters < 10000) {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(distanceInMeters / 1000)}km`;
  }
};

/**
 * Generate random coordinates within a radius of a center point
 * @param center Center coordinates
 * @param radiusInMeters Radius in meters
 * @returns Random coordinates within the radius
 */
export const generateRandomLocationWithinRadius = (
  center: Coordinates,
  radiusInMeters: number
): Coordinates => {
  // Convert radius from meters to degrees (approximate)
  const radiusInDegrees = radiusInMeters / 111320; // 1 degree ≈ 111.32 km

  // Generate random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;

  // Calculate new coordinates
  const deltaLat = distance * Math.cos(angle);
  const deltaLng = distance * Math.sin(angle) / Math.cos(center.latitude * Math.PI / 180);

  return {
    latitude: center.latitude + deltaLat,
    longitude: center.longitude + deltaLng,
  };
};

/**
 * Generate multiple random locations within a radius
 * @param center Center coordinates
 * @param count Number of locations to generate
 * @param radiusInMeters Radius in meters
 * @returns Array of random coordinates
 */
export const generateRandomLocations = (
  center: Coordinates,
  count: number,
  radiusInMeters: number = 2000
): Array<Coordinates & { id: string; name: string }> => {
  const locations = [];
  const locationNames = [
    'Mystery Spot', 'Hidden Gem', 'Secret Place', 'Discovery Point', 'Wonder Zone',
    'Magic Corner', 'Treasure Spot', 'Quest Marker', 'Adventure Point', 'Star Location',
    'Exploration Hub', 'Discovery Zone', 'Mystery Point', 'Wonder Spot', 'Quest Hub'
  ];

  for (let i = 0; i < count; i++) {
    const location = generateRandomLocationWithinRadius(center, radiusInMeters);
    locations.push({
      ...location,
      id: `random-${i + 1}`,
      name: locationNames[Math.floor(Math.random() * locationNames.length)]
    });
  }

  return locations;
};

/**
 * Check if a location is within a certain distance of another location
 * @param location1 First location
 * @param location2 Second location
 * @param thresholdInMeters Distance threshold in meters
 * @returns True if locations are within threshold distance
 */
export const isWithinDistance = (
  location1: Coordinates,
  location2: Coordinates,
  thresholdInMeters: number
): boolean => {
  const distance = calculateDistance(location1, location2);
  return distance <= thresholdInMeters;
};
