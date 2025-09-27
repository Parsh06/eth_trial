import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { OpenStreetMapView } from '../components/OpenStreetMapView';
import { LocationDebugger } from '../components/LocationDebugger';
import { GameInvitationPopup } from '../components/GameInvitationPopup';
import { StakingScreen } from './StakingScreen';
import { MathGameScreen } from './MathGameScreen';
import { GameResultScreen } from './GameResultScreen';
import { ProximityService, ProximityTarget, ProximityEvent } from '../services/ProximityService';
import { starQuestWeb3Service, StakingResult } from '../services/StarQuestWeb3Service';
import { gameCompletionService, GameResult } from '../services/GameCompletionService';
import { generateRandomLocations } from '../utils/distance';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { Star } from '../types';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = (width - 60) / GRID_SIZE;

type GameState = 'map' | 'invitation' | 'staking' | 'playing' | 'result';

export const MapScreen: React.FC = () => {
  const { stars, handleChallengeSelect, user } = useGame();
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [showMapView, setShowMapView] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Game flow state
  const [gameState, setGameState] = useState<GameState>('map');
  const [currentTarget, setCurrentTarget] = useState<ProximityTarget | null>(null);
  const [proximityDistance, setProximityDistance] = useState(0);
  const [gameResult, setGameResult] = useState<{ isWinner: boolean; score: number } | null>(null);
  const [randomTargets, setRandomTargets] = useState<ProximityTarget[]>([]);
  
  // Web3 integration state
  const [stakingResult, setStakingResult] = useState<StakingResult | null>(null);
  const [gameCompletionResult, setGameCompletionResult] = useState<GameResult | null>(null);
  const [playerBalance, setPlayerBalance] = useState<string>('0');
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);

  // Initialize Web3 connection
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        // For demo purposes, use a test private key
        // In production, this should come from secure storage
        const testPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        
        const connected = await starQuestWeb3Service.connectWallet(testPrivateKey);
        if (connected) {
          setIsWeb3Connected(true);
          const balance = await starQuestWeb3Service.getBalance();
          setPlayerBalance(balance);
          console.log('✅ Web3 connected, balance:', balance);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Web3:', error);
      }
    };

    if (user?.walletAddress) {
      initializeWeb3();
    }
  }, [user?.walletAddress]);

  const getStarColor = (status: Star['status']) => {
    switch (status) {
      case 'available':
        return colors.starAvailable;
      case 'completed':
        return colors.starCompleted;
      case 'locked':
        return colors.starLocked;
      default:
        return colors.muted;
    }
  };

  const getStarIcon = (status: Star['status']) => {
    switch (status) {
      case 'available':
        return '⭐';
      case 'completed':
        return '✅';
      case 'locked':
        return '🔒';
      default:
        return '⭐';
    }
  };

  const handleStarPress = (star: Star) => {
    if (star.status === 'locked') {
      return;
    }
    setSelectedStar(star);
  };

  const handleStartChallenge = () => {
    if (selectedStar) {
      handleChallengeSelect(selectedStar.id);
    }
  };

  const renderStarGrid = () => {
    const grid = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const star = stars.find(s => s.position.x === col + 1 && s.position.y === row + 1);
        const index = row * GRID_SIZE + col;
        
        grid.push(
          <TouchableOpacity
            key={index}
            style={[
              styles.starCell,
              { width: CELL_SIZE, height: CELL_SIZE },
              selectedStar?.id === star?.id && styles.selectedCell,
            ]}
            onPress={() => star && handleStarPress(star)}
            disabled={!star}
          >
            {star ? (
              <View style={[
                styles.starContainer,
                { backgroundColor: getStarColor(star.status) },
                star.status === 'locked' && styles.lockedStar,
              ]}>
                <Text style={styles.starIcon}>
                  {getStarIcon(star.status)}
                </Text>
                <Text style={styles.starName}>{star.name}</Text>
                <Text style={styles.starDifficulty}>
                  {star.difficulty.toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCell}>
                <Text style={styles.emptyText}>?</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }
    }
    return grid;
  };

  // Convert mock stars to map format with real coordinates around user location
  const mapStars = userLocation ? stars.map((star, index) => ({
    id: star.id,
    name: star.name,
    status: star.status,
    position: {
      latitude: userLocation.latitude + (Math.random() - 0.5) * 0.01, // Within ~500m radius
      longitude: userLocation.longitude + (Math.random() - 0.5) * 0.01,
    },
  })) : [];

  // Proximity event handler
  const handleProximityEvent = useCallback((event: ProximityEvent) => {
    console.log('🎯 MapScreen: Proximity event:', event);
    
    if (event.isEntering && gameState === 'map') {
      console.log('🎮 MapScreen: Entering game zone, showing invitation popup');
      setCurrentTarget(event.target);
      setProximityDistance(event.distance);
      setGameState('invitation');
    } else if (!event.isEntering && gameState === 'invitation') {
      console.log('👋 MapScreen: Left game zone, hiding invitation popup');
      setGameState('map');
      setCurrentTarget(null);
    }
  }, [gameState]);

  // Initialize proximity service and targets
  useEffect(() => {
    if (userLocation && randomTargets.length === 0) {
      console.log('🎯 MapScreen: Generating game targets');
      
      // Fixed star spot at specified coordinates
      const fixedStarSpot: ProximityTarget = {
        id: 'fixed-star-1',
        name: 'Star Quest Hub',
        coordinates: { latitude: 28.556743, longitude: 77.044078 },
        radius: 1.5, // 1.5 meter radius
        isActive: true,
      };
      
      // Generate additional random game locations within 2km radius
      const locations = generateRandomLocations(userLocation, 4, 2000);
      const randomTargets: ProximityTarget[] = locations.map(location => ({
        id: location.id,
        name: location.name,
        coordinates: { latitude: location.latitude, longitude: location.longitude },
        radius: 1.5, // 1.5 meter radius
        isActive: true,
      }));
      
      // Combine fixed and random targets
      const allTargets = [fixedStarSpot, ...randomTargets];
      
      setRandomTargets(allTargets);
      
      // Add targets to proximity service
      allTargets.forEach(target => {
        ProximityService.addTarget(target);
      });
      
      // Add proximity callback
      ProximityService.addCallback(handleProximityEvent);
      
      // Start tracking
      ProximityService.startTracking();
      
      console.log('🎯 MapScreen: Added', allTargets.length, 'proximity targets (1 fixed + 4 random)');
      console.log('⭐ MapScreen: Fixed star spot at:', fixedStarSpot.coordinates);
    }
    
    return () => {
      if (randomTargets.length > 0) {
        ProximityService.stopTracking();
        ProximityService.removeCallback(handleProximityEvent);
        randomTargets.forEach(target => {
          ProximityService.removeTarget(target.id);
        });
      }
    };
  }, [userLocation, randomTargets.length, handleProximityEvent]);

  const handleLocationChange = (location: { latitude: number; longitude: number }) => {
    console.log('🗺️ MapScreen: Location changed:', location);
    console.log('📊 MapScreen: Previous location:', userLocation);
    
    if (userLocation) {
      const latDiff = Math.abs(location.latitude - userLocation.latitude);
      const lngDiff = Math.abs(location.longitude - userLocation.longitude);
      console.log('📏 Location change delta:', {
        latitudeDelta: latDiff,
        longitudeDelta: lngDiff,
        significantChange: latDiff > 0.0001 || lngDiff > 0.0001, // ~11m
      });
    }
    
    setUserLocation(location);
    
    // Update proximity service with new location
    if (location) {
      ProximityService.updateLocation(location);
    }
    
    console.log('⭐ Generated map stars around location:', mapStars.length);
  };

  // Game flow handlers
  const handleStakeToPlay = () => {
    console.log('💰 MapScreen: User chose to stake and play');
    setGameState('staking');
  };

  const handleIgnoreGame = () => {
    console.log('🚫 MapScreen: User chose to ignore game');
    setGameState('map');
    setCurrentTarget(null);
  };

  const handleStakingComplete = (result?: StakingResult) => {
    console.log('💰 MapScreen: Staking complete', result);
    if (result?.success) {
      setStakingResult(result);
      setGameState('playing');
      console.log('✅ Staking successful, challenge ID:', result.challengeId);
    } else {
      console.log('❌ Staking failed, returning to map');
      setGameState('map');
    }
  };

  const handleGameComplete = async (isWinner: boolean, score: number) => {
    console.log('🎮 MapScreen: Game complete:', { isWinner, score });
    setGameResult({ isWinner, score });
    
    // Complete the blockchain challenge
    if (stakingResult?.challengeId) {
      try {
        const completionResult = await gameCompletionService.completeChallenge(
          stakingResult.challengeId,
          isWinner
        );
        setGameCompletionResult(completionResult);
        console.log('🎯 Challenge completed on blockchain:', completionResult);
      } catch (error) {
        console.error('❌ Failed to complete challenge on blockchain:', error);
      }
    }
    
    setGameState('result');
  };

  const handleBackToMap = () => {
    console.log('🗺️ MapScreen: Returning to map');
    setGameState('map');
    setCurrentTarget(null);
    setGameResult(null);
    setStakingResult(null);
    setGameCompletionResult(null);
  };

  const handlePlayAgain = () => {
    console.log('🔄 MapScreen: Playing again');
    setGameResult(null);
    setStakingResult(null);
    setGameCompletionResult(null);
    setGameState('staking');
  };

  // Render different screens based on game state
  if (gameState === 'staking' && currentTarget) {
    return (
      <StakingScreen
        onStakingComplete={handleStakingComplete}
        stakeAmount="0.01 HBAR"
        targetName={currentTarget.name}
        starId={1} // Use appropriate star ID
        privateKey="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" // Demo key
      />
    );
  }

  if (gameState === 'playing' && currentTarget) {
    return (
      <MathGameScreen
        onGameComplete={handleGameComplete}
        stakeAmount="0.01 ETH"
        targetName={currentTarget.name}
      />
    );
  }

  if (gameState === 'result' && gameResult && currentTarget) {
    const rewardAmount = gameCompletionResult?.payout || "0.02";
    const transactionHash = gameCompletionResult?.transactionHash || stakingResult?.transactionHash;
    
    return (
      <GameResultScreen
        isWinner={gameResult.isWinner}
        score={gameResult.score}
        stakeAmount="0.01 HBAR"
        rewardAmount={`${rewardAmount} HBAR`}
        targetName={currentTarget.name}
        transactionHash={transactionHash}
        onBackToMap={handleBackToMap}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Combine existing stars with random game targets for map display
  const allMapStars = userLocation ? [
    ...mapStars,
    ...randomTargets.map(target => ({
      id: target.id,
      name: target.name,
      status: 'available' as const,
      position: {
        latitude: target.coordinates.latitude,
        longitude: target.coordinates.longitude,
      },
      type: target.id === 'fixed-star-1' ? 'fixed' as const : 'game' as const,
    }))
  ] : [];

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
              {isWeb3Connected && (
                <Text style={styles.balanceText}>💰 Balance: {playerBalance} HBAR</Text>
              )}
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

        {/* Map or Grid View */}
        {showMapView ? (
          <View style={styles.mapContainer}>
            <OpenStreetMapView
              onLocationChange={handleLocationChange}
              showStars={true}
              stars={allMapStars}
            />
          </View>
        ) : (
          <ScrollView style={styles.gridScrollView} showsVerticalScrollIndicator={false}>

        {/* Star Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {renderStarGrid()}
          </View>
        </View>

        {/* Star Details */}
        {selectedStar && (
          <NeoCard style={styles.starDetailsCard}>
            <Text style={styles.starDetailsTitle}>{selectedStar.name}</Text>
            <Text style={styles.starDetailsDescription}>
              {selectedStar.description}
            </Text>
            
            <View style={styles.starInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Difficulty</Text>
                <Text style={[styles.infoValue, { 
                  color: selectedStar.difficulty === 'expert' ? colors.error : 
                        selectedStar.difficulty === 'intermediate' ? colors.warning : 
                        colors.success 
                }]}>
                  {selectedStar.difficulty.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Reward</Text>
                <Text style={styles.infoValue}>{selectedStar.reward.name}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rarity</Text>
                <Text style={[styles.infoValue, { 
                  color: selectedStar.reward.rarity === 'legendary' ? colors.electricOrange :
                        selectedStar.reward.rarity === 'epic' ? colors.electricPurple :
                        selectedStar.reward.rarity === 'rare' ? colors.info :
                        colors.mutedForeground
                }]}>
                  {selectedStar.reward.rarity.toUpperCase()}
                </Text>
              </View>
            </View>

            {selectedStar.status === 'available' && (
                <NeoButton
                  title="Start Challenge"
                  onPress={handleStartChallenge}
                  variant="electric"
                  size="large"
                  style={styles.challengeButton}
                />
            )}

            {selectedStar.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✅ COMPLETED</Text>
              </View>
            )}

            {selectedStar.status === 'locked' && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>🔒 LOCKED</Text>
              </View>
            )}
          </NeoCard>
        )}

            {/* Legend */}
            <NeoCard style={styles.legendCard}>
              <Text style={styles.legendTitle}>Legend</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.starAvailable }]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.starCompleted }]} />
                  <Text style={styles.legendText}>Completed</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.starLocked }]} />
                  <Text style={styles.legendText}>Locked</Text>
                </View>
              </View>
            </NeoCard>
          </ScrollView>
        )}
        
        {/* Location Debugger */}
        <LocationDebugger />
        
        {/* Game Invitation Popup */}
        <GameInvitationPopup
          visible={gameState === 'invitation'}
          target={currentTarget}
          distance={proximityDistance}
          onStakeToPlay={handleStakeToPlay}
          onIgnore={handleIgnoreGame}
          onClose={handleIgnoreGame}
        />
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
  gridScrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
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
  balanceText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginTop: 4,
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
