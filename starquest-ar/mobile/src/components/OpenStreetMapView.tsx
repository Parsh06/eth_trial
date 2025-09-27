import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoButton } from './ui/NeoButton';

const { width, height } = Dimensions.get('window');

interface OpenStreetMapViewProps {
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
  showStars?: boolean;
  stars?: Array<{
    id: string;
    name: string;
    position: { latitude: number; longitude: number };
    status: 'available' | 'completed' | 'locked';
  }>;
}

export const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  onLocationChange,
  showStars = false,
  stars = [],
}) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location access in settings.');
        setLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);
      onLocationChange?.(coords);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get current location. Please try again.');
      setLoading(false);
    }
  };

  const generateMapHTML = () => {
    if (!location) return '';

    const starsData = showStars ? JSON.stringify(stars.map(star => ({
      ...star,
      lat: star.position.latitude,
      lng: star.position.longitude,
    }))) : '[]';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StarQuest Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            #map { height: 100vh; width: 100vw; }
            .custom-div-icon {
                background: none;
                border: none;
            }
            .location-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #8B5CF6;
                border: 3px solid #FFFFFF;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
            }
            .star-marker {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                border: 2px solid #FFFFFF;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .star-available { background: #10B981; }
            .star-completed { background: #F59E0B; }
            .star-locked { background: #6B7280; }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            .leaflet-popup-content-wrapper {
                background: #1F2937;
                color: #FFFFFF;
                border-radius: 12px;
            }
            .leaflet-popup-content {
                margin: 12px 16px;
                line-height: 1.4;
            }
            .leaflet-popup-tip {
                background: #1F2937;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Initialize map
            const map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add current location marker
            const locationIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div class="location-marker"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const locationMarker = L.marker([${location.latitude}, ${location.longitude}], { 
                icon: locationIcon 
            }).addTo(map);

            locationMarker.bindPopup('<b>📍 Your Location</b><br/>You are here!');

            // Add stars if provided
            const starsData = ${starsData};
            starsData.forEach(star => {
                const starIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: \`<div class="star-marker star-\${star.status}">
                        \${star.status === 'available' ? '⭐' : 
                          star.status === 'completed' ? '✅' : '🔒'}
                    </div>\`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const starMarker = L.marker([star.lat, star.lng], { 
                    icon: starIcon 
                }).addTo(map);

                starMarker.bindPopup(\`
                    <b>\${star.name}</b><br/>
                    Status: \${star.status.toUpperCase()}<br/>
                    \${star.status === 'available' ? 'Tap to collect!' : 
                      star.status === 'completed' ? 'Already collected' : 'Unlock first'}
                \`);

                // Send star click to React Native
                starMarker.on('click', () => {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'starClick',
                        starId: star.id,
                        star: star
                    }));
                });
            });

            // Add accuracy circle
            const accuracyCircle = L.circle([${location.latitude}, ${location.longitude}], {
                radius: 50, // 50 meters
                fillColor: '#8B5CF6',
                color: '#8B5CF6',
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.1
            }).addTo(map);

            // Handle location updates
            function updateLocation(lat, lng) {
                locationMarker.setLatLng([lat, lng]);
                accuracyCircle.setLatLng([lat, lng]);
                map.setView([lat, lng], map.getZoom());
            }

            // Notify React Native that map is ready
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'mapReady'
            }));

            // Handle map events
            map.on('click', (e) => {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'mapClick',
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                }));
            });
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapReady':
          setMapReady(true);
          break;
        case 'starClick':
          Alert.alert(
            `${data.star.name}`,
            `Status: ${data.star.status.toUpperCase()}\n\nWould you like to start a challenge for this star?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Start Challenge', onPress: () => {
                // Handle star challenge start
                console.log('Starting challenge for star:', data.starId);
              }},
            ]
          );
          break;
        case 'mapClick':
          console.log('Map clicked at:', data.latitude, data.longitude);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const centerOnLocation = () => {
    if (webViewRef.current && location) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'centerOnLocation',
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <NeoButton
          title="Try Again"
          onPress={getCurrentLocation}
          variant="primary"
          size="medium"
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🗺️</Text>
        <Text style={styles.errorTitle}>No Location</Text>
        <Text style={styles.errorMessage}>Unable to determine your location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />
      
      {/* Floating controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={getCurrentLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Location info */}
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    ...typography.heading2,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    width: 200,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 60,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  controlIcon: {
    fontSize: 20,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  locationText: {
    ...typography.caption,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
