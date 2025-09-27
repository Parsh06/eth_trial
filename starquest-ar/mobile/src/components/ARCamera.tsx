import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Sensors from 'expo-sensors';

const { width, height } = Dimensions.get('window');

interface ARCameraProps {
  onCameraReady?: () => void;
  onLocationUpdate?: (location: Location.LocationObject) => void;
  onOrientationUpdate?: (orientation: any) => void;
}

export const ARCamera: React.FC<ARCameraProps> = ({
  onCameraReady,
  onLocationUpdate,
  onOrientationUpdate,
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    requestPermissions();
    setupSensors();
    return () => {
      cleanup();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Camera permission is required for AR functionality. Please enable it in your device settings.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      // Request location permission (optional for AR)
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (locationError) {
        console.warn('Location permission not available:', locationError);
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request permissions. Please check your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const setupSensors = async () => {
    try {
      // Check if accelerometer is available
      const isAvailable = await Sensors.Accelerometer.isAvailableAsync();
      if (isAvailable) {
        // Set update interval for accelerometer
        Sensors.Accelerometer.setUpdateInterval(100);
        
        // Subscribe to accelerometer updates
        const subscription = Sensors.Accelerometer.addListener(({ x, y, z }) => {
          onOrientationUpdate?.({ x, y, z, timestamp: Date.now() });
        });
        
        return () => subscription?.remove();
      }
    } catch (error) {
      console.error('Sensor setup error:', error);
    }
  };

  const setupLocationTracking = async () => {
    try {
      const isAvailable = await Location.hasServicesEnabledAsync();
      if (isAvailable) {
        // Start location tracking
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            onLocationUpdate?.(location);
          }
        );
        
        return locationSubscription;
      }
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  const handleCameraReady = () => {
    setCameraReady(true);
    onCameraReady?.();
    setupLocationTracking();
  };

  const cleanup = () => {
    // Cleanup sensors and location tracking
    Sensors.Accelerometer.removeAllListeners();
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required for AR</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={handleCameraReady}
      />
      
      {/* Camera overlay for AR tracking */}
      {cameraReady && (
        <View style={styles.cameraOverlay}>
          {/* AR tracking indicators */}
          <View style={styles.trackingIndicator} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 0, 0.8)',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
