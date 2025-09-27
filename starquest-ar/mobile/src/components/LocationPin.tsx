import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { formatDistance, Coordinates } from '../utils/distance';

export interface LocationPinData {
  id: string;
  name: string;
  coordinates: Coordinates;
  type?: 'quest' | 'treasure' | 'mystery' | 'discovery';
  status?: 'available' | 'visited' | 'locked';
  description?: string;
}

interface LocationPinProps {
  pin: LocationPinData;
  distance?: number;
  onPress?: (pin: LocationPinData) => void;
  isSelected?: boolean;
  showDistance?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const LocationPin: React.FC<LocationPinProps> = ({
  pin,
  distance,
  onPress,
  isSelected = false,
  showDistance = true,
  size = 'medium',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected, scaleAnim]);

  const handlePress = () => {
    if (onPress) {
      onPress(pin);
    }
  };

  const getPinColor = () => {
    if (pin.status === 'visited') return colors.success;
    if (pin.status === 'locked') return colors.muted;
    
    switch (pin.type) {
      case 'quest':
        return colors.primary;
      case 'treasure':
        return colors.warning;
      case 'mystery':
        return colors.electricPurple;
      case 'discovery':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const getPinIcon = () => {
    if (pin.status === 'visited') return '✅';
    if (pin.status === 'locked') return '🔒';
    
    switch (pin.type) {
      case 'quest':
        return '⭐';
      case 'treasure':
        return '💎';
      case 'mystery':
        return '❓';
      case 'discovery':
        return '🔍';
      default:
        return '📍';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 40, height: 40 },
          icon: { fontSize: 16 },
          name: { fontSize: 10 },
        };
      case 'large':
        return {
          container: { width: 60, height: 60 },
          icon: { fontSize: 24 },
          name: { fontSize: 14 },
        };
      default:
        return {
          container: { width: 50, height: 50 },
          icon: { fontSize: 20 },
          name: { fontSize: 12 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.container,
          sizeStyles.container,
          { 
            backgroundColor: getPinColor(),
            transform: [{ scale: scaleAnim }],
          },
          isSelected && styles.selectedContainer,
          pin.status === 'locked' && styles.lockedContainer,
        ]}
      >
        <Text style={[styles.icon, { fontSize: sizeStyles.icon.fontSize }]}>
          {getPinIcon()}
        </Text>
        
        {size !== 'small' && (
          <Text 
            style={[
              styles.name, 
              { fontSize: sizeStyles.name.fontSize },
              pin.status === 'locked' && styles.lockedText,
            ]} 
            numberOfLines={1}
          >
            {pin.name}
          </Text>
        )}
        
        {showDistance && distance !== undefined && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {formatDistance(distance)}
            </Text>
          </View>
        )}
      </Animated.View>
      
      {/* Pulse animation for available pins */}
      {pin.status === 'available' && (
        <Animated.View
          style={[
            styles.pulseRing,
            sizeStyles.container,
            { backgroundColor: getPinColor() },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    position: 'relative',
  },
  selectedContainer: {
    borderColor: colors.electricOrange,
    borderWidth: 4,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  icon: {
    color: colors.background,
    fontWeight: 'bold',
  },
  name: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  lockedText: {
    color: colors.mutedForeground,
  },
  distanceBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.foreground,
    fontWeight: '600',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 25,
    opacity: 0.3,
    animation: 'pulse 2s infinite',
  },
});
