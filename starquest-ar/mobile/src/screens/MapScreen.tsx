import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { OpenStreetMapView } from '../components/OpenStreetMapView';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { Star } from '../types';
import { api } from '../services/api';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = (width - 60) / GRID_SIZE;

interface NearbyStar {
  _id: string;
  name: string;
  description: string;
  rarity: string;
  type: string;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: {
    arModel?: string;
    animation?: string;
    sound?: string;
    particleEffect?: string;
    glowColor?: string;
    size: number;
    rotation: { x: number; y: number; z: number };
  };
  rewards: {
    experience: number;
    tokens?: number;
    nft?: string;
  };
  status: string;
  distance: number;
  isNearby: boolean;
}

export const MapScreen: React.FC = () => {
  const { stars, handleChallengeSelect } = useGame();
  const [selectedStar, setSelectedStar] = useState<NearbyStar | null>(null);
  const [showMapView, setShowMapView] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyStars, setNearbyStars] = useState<NearbyStar[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Request location permission and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(coords);
        fetchNearbyStars(coords);
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to discover nearby stars and challenges.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const fetchNearbyStars = async (location: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      const response = await api.get('/location/nearby', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 1000, // 1km radius
        },
      });

      if (response.data.success) {
        setNearbyStars(response.data.stars);
      }
    } catch (error) {
      console.error('Error fetching nearby stars:', error);
      Alert.alert('Error', 'Failed to load nearby stars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverStar = async (star: NearbyStar) => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const response = await api.post(`/location/discover/${star._id}`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      if (response.data.success) {
        Alert.alert(
          'Star Discovered!',
          `You found ${star.name}! You earned ${star.rewards.experience} XP and ${star.rewards.tokens || 0} tokens.`,
          [{ text: 'Awesome!', onPress: () => fetchNearbyStars(userLocation) }]
        );
      }
    } catch (error: any) {
      console.error('Error discovering star:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to discover star.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartARChallenge = async (star: NearbyStar) => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const response = await api.post(`/location/challenge/${star._id}/start`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      if (response.data.success) {
        // Navigate to AR screen with challenge data
        // This would integrate with your AR navigation
        Alert.alert(
          'AR Challenge Started!',
          'Get ready to interact with the star in AR mode!',
          [{ text: 'Start AR', onPress: () => {
            // Navigate to AR screen
            // navigation.navigate('ARChallenge', { challenge: response.data.challenge });
          }}]
        );
      }
    } catch (error: any) {
      console.error('Error starting AR challenge:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to start AR challenge.');
    } finally {
      setLoading(false);
    }
  };

  const getStarColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return colors.electricOrange;
      case 'epic':
        return colors.electricPurple;
      case 'rare':
        return colors.info;
      case 'uncommon':
        return colors.warning;
      case 'common':
        return colors.success;
      default:
        return colors.muted;
    }
  };

  const getStarIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '🌟';
      case 'epic':
        return '⭐';
      case 'rare':
        return '✨';
      case 'uncommon':
        return '💫';
      case 'common':
        return '⭐';
      default:
        return '⭐';
    }
  };

  const handleStarPress = (star: NearbyStar) => {
    setSelectedStar(star);
  };

  const handleLocationChange = (location: { latitude: number; longitude: number }) => {
    setUserLocation(location);
    fetchNearbyStars(location);
  };

  const renderNearbyStarsList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding nearby stars...</Text>
        </View>
      );
    }

    if (nearbyStars.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No stars nearby</Text>
          <Text style={styles.emptyDescription}>
            Walk around to discover hidden stars in your area!
          </Text>
        </View>
      );
    }

    return nearbyStars.map((star) => (
      <TouchableOpacity
        key={star._id}
        style={[
          styles.starCard,
          selectedStar?._id === star._id && styles.selectedStarCard,
        ]}
        onPress={() => handleStarPress(star)}
      >
        <View style={[
          styles.starIconContainer,
          { backgroundColor: getStarColor(star.rarity) }
        ]}>
          <Text style={styles.starIcon}>{getStarIcon(star.rarity)}</Text>
        </View>
        
        <View style={styles.starInfo}>
          <Text style={styles.starName}>{star.name}</Text>
          <Text style={styles.starDescription} numberOfLines={2}>
            {star.description}
          </Text>
          <View style={styles.starDetails}>
            <Text style={styles.starRarity}>{star.rarity.toUpperCase()}</Text>
            <Text style={styles.starDistance}>{Math.round(star.distance)}m away</Text>
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardText}>
              {star.rewards.experience} XP • {star.rewards.tokens || 0} tokens
            </Text>
          </View>
        </View>

        {star.isNearby && (
          <View style={styles.nearbyBadge}>
            <Text style={styles.nearbyText}>NEARBY</Text>
          </View>
        )}
      </TouchableOpacity>
    ));
  };

  // Convert nearby stars to map format
  const mapStars = nearbyStars.map((star) => ({
    id: star._id,
    name: star.name,
    status: star.status,
    position: {
      latitude: star.location.coordinates.latitude,
      longitude: star.location.coordinates.longitude,
    },
    rarity: star.rarity,
    distance: star.distance,
    isNearby: star.isNearby,
  }));

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Header with Toggle */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Star Map</Text>
              <Text style={styles.subtitle}>
                {showMapView ? 'Your real-world location' : 'Grid view of available stars'}
              </Text>
            </View>
            <View style={styles.viewToggle}>
              <Text style={styles.toggleLabel}>Grid</Text>
              <Switch
                value={showMapView}
                onValueChange={setShowMapView}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={showMapView ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text style={styles.toggleLabel}>Map</Text>
            </View>
          </View>
        </View>

        {/* Map or List View */}
        {showMapView ? (
          <View style={styles.mapContainer}>
            <OpenStreetMapView
              onLocationChange={handleLocationChange}
              showStars={true}
              stars={mapStars}
            />
          </View>
        ) : (
          <ScrollView style={styles.listScrollView} showsVerticalScrollIndicator={false}>
            {renderNearbyStarsList()}

        {/* Star Details */}
        {selectedStar && (
          <NeoCard style={styles.starDetailsCard}>
            <Text style={styles.starDetailsTitle}>{selectedStar.name}</Text>
            <Text style={styles.starDetailsDescription}>
              {selectedStar.description}
            </Text>
            
            <View style={styles.starInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{selectedStar.type.toUpperCase()}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>{Math.round(selectedStar.distance)}m away</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rarity</Text>
                <Text style={[styles.infoValue, { 
                  color: getStarColor(selectedStar.rarity)
                }]}>
                  {selectedStar.rarity.toUpperCase()}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rewards</Text>
                <Text style={styles.infoValue}>
                  {selectedStar.rewards.experience} XP • {selectedStar.rewards.tokens || 0} tokens
                </Text>
              </View>
            </View>

            {selectedStar.isNearby ? (
              <View style={styles.actionButtons}>
                <NeoButton
                  title="Discover Star"
                  onPress={() => handleDiscoverStar(selectedStar)}
                  variant="electric"
                  size="lg"
                  style={styles.actionButton}
                />
                <NeoButton
                  title="Start AR Challenge"
                  onPress={() => handleStartARChallenge(selectedStar)}
                  variant="secondary"
                  size="lg"
                  style={styles.actionButton}
                />
              </View>
            ) : (
              <View style={styles.distanceWarning}>
                <Text style={styles.distanceWarningText}>
                  Get closer to discover this star! ({Math.round(selectedStar.distance)}m away)
                </Text>
              </View>
            )}
          </NeoCard>
        )}

            {/* Legend */}
            <NeoCard style={styles.legendCard}>
              <Text style={styles.legendTitle}>Star Rarity</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.electricOrange }]} />
                  <Text style={styles.legendText}>Legendary</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.electricPurple }]} />
                  <Text style={styles.legendText}>Epic</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                  <Text style={styles.legendText}>Rare</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.legendText}>Uncommon</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Common</Text>
                </View>
              </View>
            </NeoCard>
          </ScrollView>
        )}
      </View>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.card,
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  listScrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 8,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  starCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectedStarCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  starIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  starInfo: {
    flex: 1,
  },
  starName: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 4,
  },
  starDescription: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  starDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  starRarity: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '600',
  },
  starDistance: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  rewardInfo: {
    marginTop: 4,
  },
  rewardText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  nearbyBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  nearbyText: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontWeight: '700',
    fontSize: 10,
  },
  actionButtons: {
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  distanceWarning: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    marginTop: 16,
  },
  distanceWarningText: {
    ...typography.body,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  gridContainer: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  starCell: {
    marginBottom: 12,
    borderRadius: 8,
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  starContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  lockedStar: {
    opacity: 0.5,
  },
  starIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  starName: {
    ...typography.caption,
    color: colors.primaryForeground,
    textAlign: 'center',
    fontWeight: '700',
  },
  starDifficulty: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontSize: 8,
    fontWeight: '600',
  },
  emptyCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 24,
    color: colors.mutedForeground,
  },
  starDetailsCard: {
    marginBottom: 24,
  },
  starDetailsTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 8,
  },
  starDetailsDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 16,
  },
  starInfo: {
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  infoValue: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
  },
  challengeButton: {
    marginTop: 8,
  },
  completedBadge: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  completedText: {
    ...typography.body,
    color: colors.primaryForeground,
    fontWeight: '700',
  },
  lockedBadge: {
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  lockedText: {
    ...typography.body,
    color: colors.mutedForeground,
    fontWeight: '700',
  },
  legendCard: {
    marginBottom: 24,
  },
  legendTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  legendText: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '600',
  },
});
