import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { formatDistance, Coordinates, calculateDistance } from '../utils/distance';

interface DistanceDisplayProps {
  from: Coordinates;
  to: Coordinates;
  label?: string;
  showAccuracy?: boolean;
  style?: any;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  from,
  to,
  label = 'Distance',
  showAccuracy = false,
  style,
}) => {
  const distance = calculateDistance(from, to);
  const formattedDistance = formatDistance(distance);

  // Log distance calculation for debugging
  React.useEffect(() => {
    console.log('📏 Distance calculation:', {
      from,
      to,
      distanceInMeters: distance,
      formattedDistance,
      label,
    });
  }, [from.latitude, from.longitude, to.latitude, to.longitude, distance, formattedDistance, label]);

  const getDistanceColor = () => {
    if (distance < 50) return colors.success; // Very close
    if (distance < 200) return colors.warning; // Close
    if (distance < 1000) return colors.info; // Medium distance
    return colors.mutedForeground; // Far
  };

  const getDistanceIcon = () => {
    if (distance < 50) return '🎯'; // Very close
    if (distance < 200) return '📍'; // Close
    if (distance < 1000) return '🗺️'; // Medium distance
    return '🌍'; // Far
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{getDistanceIcon()}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.distance, { color: getDistanceColor() }]}>
          {formattedDistance}
        </Text>
        {showAccuracy && (
          <Text style={styles.accuracy}>
            Lat: {to.latitude.toFixed(6)}, Lng: {to.longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  distance: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  accuracy: {
    ...typography.caption,
    color: colors.mutedForeground,
    fontFamily: 'monospace',
  },
});
