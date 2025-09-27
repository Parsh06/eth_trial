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
    type?: 'star' | 'game' | 'fixed';
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
      console.log('🌍 Starting location request...');

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Location permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        setError('Location permission denied. Please enable location access in settings.');
        setLoading(false);
        return;
      }

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      console.log('🛰️ Location services enabled:', isLocationEnabled);
      
      if (!isLocationEnabled) {
        console.log('❌ Location services are disabled');
        setError('Location services are disabled. Please enable them in your device settings.');
        setLoading(false);
        return;
      }

      console.log('📡 Requesting high accuracy location...');
      
      // Get current position with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      console.log('📍 Raw location data:', {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        altitude: currentLocation.coords.altitude,
        altitudeAccuracy: currentLocation.coords.altitudeAccuracy,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        timestamp: new Date(currentLocation.timestamp).toISOString(),
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      console.log('✅ Location successfully obtained:', coords);
      console.log('🎯 Location accuracy:', currentLocation.coords.accuracy, 'meters');

      setLocation(coords);
      onLocationChange?.(coords);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error getting location:', error);
      console.log('🔍 Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
      });
      setError('Failed to get current location. Please try again.');
      setLoading(false);
    }
  };

  const generateMapHTML = () => {
    if (!location) {
      console.log('⚠️ No location available for map generation');
      return '';
    }

    console.log('🗺️ Generating map HTML with location:', location);
    
    const starsData = showStars ? JSON.stringify(stars.map(star => ({
      ...star,
      lat: star.position.latitude,
      lng: star.position.longitude,
      type: star.type || 'star',
    }))) : '[]';
    
    console.log('⭐ Stars data for map:', starsData);

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
            .star-fixed { 
                background: linear-gradient(45deg, #8B5CF6, #EC4899);
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
                animation: glow 2s infinite alternate;
            }
            @keyframes glow {
                0% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); }
                100% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.9), 0 0 40px rgba(236, 72, 153, 0.6); }
            }
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
            console.log('🗺️ WebView: Initializing map with coordinates:', ${location.latitude}, ${location.longitude});
            const map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);

            // Add OpenStreetMap tiles
            console.log('🌍 WebView: Adding OpenStreetMap tiles');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add current location marker
            console.log('📍 WebView: Adding location marker at:', ${location.latitude}, ${location.longitude});
            const locationIcon = L.divIcon({
                className: 'custom-div-icon',
                html: '<div class="location-marker"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const locationMarker = L.marker([${location.latitude}, ${location.longitude}], { 
                icon: locationIcon 
            }).addTo(map);

            locationMarker.bindPopup('<b>📍 Your Location</b><br/>You are here!<br/>Lat: ${location.latitude.toFixed(6)}<br/>Lng: ${location.longitude.toFixed(6)}');

            // Add stars if provided
            const starsData = ${starsData};
            console.log('⭐ WebView: Processing stars data:', starsData.length, 'stars');
            starsData.forEach((star, index) => {
                console.log(\`⭐ WebView: Adding star \${index + 1}:\`, star.name, 'at', star.lat, star.lng, 'type:', star.type);
                
                // Determine marker class and icon based on type
                let markerClass = \`star-\${star.status}\`;
                let markerIcon = star.status === 'available' ? '⭐' : 
                               star.status === 'completed' ? '✅' : '🔒';
                
                if (star.type === 'fixed') {
                    markerClass = 'star-fixed';
                    markerIcon = '🌟'; // Special icon for fixed star spot
                } else if (star.type === 'game') {
                    markerIcon = '🎮'; // Game controller for game locations
                }
                
                const starIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: \`<div class="star-marker \${markerClass}">
                        \${markerIcon}
                    </div>\`,
                    iconSize: star.type === 'fixed' ? [35, 35] : [30, 30],
                    iconAnchor: star.type === 'fixed' ? [17.5, 17.5] : [15, 15]
                });

                const starMarker = L.marker([star.lat, star.lng], { 
                    icon: starIcon 
                }).addTo(map);

                // Enhanced popup content based on type
                let popupContent = \`<b>\${star.name}</b><br/>\`;
                
                if (star.type === 'fixed') {
                    popupContent += \`
                        <span style="color: #8B5CF6;">🌟 Special Star Quest Hub</span><br/>
                        <span style="color: #10B981;">📍 Fixed Location</span><br/>
                        <span style="color: #F59E0B;">🎮 Game Available!</span><br/>
                        <small>Coordinates: \${star.lat.toFixed(6)}, \${star.lng.toFixed(6)}</small>
                    \`;
                } else if (star.type === 'game') {
                    popupContent += \`
                        <span style="color: #EC4899;">🎮 Game Challenge</span><br/>
                        Status: \${star.status.toUpperCase()}<br/>
                        \${star.status === 'available' ? 'Get within 1.5m to play!' : 
                          star.status === 'completed' ? 'Already played' : 'Unlock first'}
                    \`;
                } else {
                    popupContent += \`
                        Status: \${star.status.toUpperCase()}<br/>
                        \${star.status === 'available' ? 'Tap to collect!' : 
                          star.status === 'completed' ? 'Already collected' : 'Unlock first'}
                    \`;
                }
                
                starMarker.bindPopup(popupContent);

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
                console.log('🔄 WebView: Updating location to:', lat, lng);
                locationMarker.setLatLng([lat, lng]);
                accuracyCircle.setLatLng([lat, lng]);
                map.setView([lat, lng], map.getZoom());
            }

            // Notify React Native that map is ready
            console.log('✅ WebView: Map is ready, notifying React Native');
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'mapReady'
            }));

            // Handle map events
            map.on('click', (e) => {
                console.log('🗺️ WebView: Map clicked at:', e.latlng.lat, e.latlng.lng);
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
      console.log('📱 WebView message received:', data);
      
      switch (data.type) {
        case 'mapReady':
          console.log('🗺️ Map is ready for interaction');
          setMapReady(true);
          break;
        case 'starClick':
          console.log('⭐ Star clicked:', data.starId, data.star);
          Alert.alert(
            `${data.star.name}`,
            `Status: ${data.star.status.toUpperCase()}\n\nWould you like to start a challenge for this star?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Start Challenge', onPress: () => {
                // Handle star challenge start
                console.log('🎯 Starting challenge for star:', data.starId);
              }},
            ]
          );
          break;
        case 'mapClick':
          console.log('🗺️ Map clicked at coordinates:', {
            latitude: data.latitude,
            longitude: data.longitude,
            currentLocation: location,
          });
          break;
      }
    } catch (error) {
      console.error('❌ Error parsing WebView message:', error);
      console.log('🔍 Raw message data:', event.nativeEvent.data);
    }
  };

  const centerOnLocation = () => {
    if (webViewRef.current && location) {
      console.log('🎯 Centering map on location:', location);
      webViewRef.current.postMessage(JSON.stringify({
        type: 'centerOnLocation',
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    } else {
      console.log('⚠️ Cannot center on location - WebView or location not available:', {
        hasWebView: !!webViewRef.current,
        hasLocation: !!location,
      });
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
          variant="default"
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
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
