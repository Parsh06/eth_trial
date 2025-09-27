import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoCard } from './ui/NeoCard';
import { NeoButton } from './ui/NeoButton';

interface LocationLog {
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
}

export const LocationDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    if (isTracking) {
      console.log('🔄 LocationDebugger: Starting location tracking...');
      startLocationTracking();
    } else {
      console.log('⏹️ LocationDebugger: Stopping location tracking');
      if (subscription) {
        subscription.remove();
      }
    }

    async function startLocationTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('❌ LocationDebugger: Permission denied');
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000, // Update every 2 seconds
            distanceInterval: 5, // Update every 5 meters
          },
          (location) => {
            console.log('📍 LocationDebugger: New location received:', location);
            
            setCurrentLocation(location);
            
            const logEntry: LocationLog = {
              timestamp: new Date(location.timestamp).toLocaleTimeString(),
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              speed: location.coords.speed,
              heading: location.coords.heading,
              altitude: location.coords.altitude,
            };

            setLocationLogs(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
          }
        );
      } catch (error) {
        console.error('❌ LocationDebugger: Error starting tracking:', error);
      }
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const clearLogs = () => {
    setLocationLogs([]);
  };

  const getCurrentLocationOnce = async () => {
    try {
      console.log('📡 LocationDebugger: Getting current location once...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
      });
      
      console.log('📍 LocationDebugger: One-time location:', location);
      setCurrentLocation(location);
      
      const logEntry: LocationLog = {
        timestamp: new Date(location.timestamp).toLocaleTimeString() + ' (manual)',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        altitude: location.coords.altitude,
      };

      setLocationLogs(prev => [logEntry, ...prev.slice(0, 19)]);
    } catch (error) {
      console.error('❌ LocationDebugger: Error getting location:', error);
    }
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.debugButtonText}>🐛 Debug</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.debugOverlay}>
      <NeoCard style={styles.debugCard}>
        <View style={styles.header}>
          <Text style={styles.title}>Location Debugger</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsVisible(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Current Location Info */}
        {currentLocation && (
          <View style={styles.currentLocationSection}>
            <Text style={styles.sectionTitle}>Current Location</Text>
            <Text style={styles.locationText}>
              📍 {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              🎯 Accuracy: {currentLocation.coords.accuracy?.toFixed(1) || 'N/A'}m
            </Text>
            <Text style={styles.infoText}>
              ⏰ Time: {new Date(currentLocation.timestamp).toLocaleTimeString()}
            </Text>
            {currentLocation.coords.speed !== null && (
              <Text style={styles.infoText}>
                🏃 Speed: {(currentLocation.coords.speed * 3.6).toFixed(1)} km/h
              </Text>
            )}
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <NeoButton
            title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
            onPress={toggleTracking}
            variant={isTracking ? 'destructive' : 'primary'}
            size="small"
          />
          <NeoButton
            title="Get Location"
            onPress={getCurrentLocationOnce}
            variant="secondary"
            size="small"
          />
          <NeoButton
            title="Clear Logs"
            onPress={clearLogs}
            variant="outline"
            size="small"
          />
        </View>

        {/* Location Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Location History</Text>
          <ScrollView style={styles.logsList} showsVerticalScrollIndicator={false}>
            {locationLogs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text style={styles.logCoords}>
                  {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                </Text>
                <Text style={styles.logAccuracy}>
                  ±{log.accuracy?.toFixed(1) || 'N/A'}m
                </Text>
              </View>
            ))}
            {locationLogs.length === 0 && (
              <Text style={styles.emptyText}>No location logs yet</Text>
            )}
          </ScrollView>
        </View>
      </NeoCard>
    </View>
  );
};

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  debugButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  debugCard: {
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.heading3,
    color: colors.foreground,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.mutedForeground,
  },
  currentLocationSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.muted,
    borderRadius: 8,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationText: {
    ...typography.body,
    color: colors.foreground,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  logsSection: {
    flex: 1,
  },
  logsList: {
    maxHeight: 200,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logTime: {
    ...typography.caption,
    color: colors.mutedForeground,
    flex: 1,
  },
  logCoords: {
    ...typography.caption,
    color: colors.foreground,
    fontFamily: 'monospace',
    flex: 2,
  },
  logAccuracy: {
    ...typography.caption,
    color: colors.mutedForeground,
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    padding: 20,
  },
});
