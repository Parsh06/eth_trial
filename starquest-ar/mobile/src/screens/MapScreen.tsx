import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { Star } from '../types';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = (width - 60) / GRID_SIZE;

export const MapScreen: React.FC = () => {
  console.log('🗺️ MapScreen: Rendering simple version');
  
  const { stars } = useGame();
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);

  const getStarColor = (status: Star['status']) => {
    switch (status) {
      case 'available':
        return colors.electricGreen;
      case 'completed':
        return colors.electricBlue;
      case 'locked':
        return colors.muted;
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
      Alert.alert('Locked', 'Complete previous challenges to unlock this star!');
      return;
    }
    setSelectedStar(star);
  };

  const handleStartChallenge = () => {
    Alert.alert('Challenge', 'This feature is coming soon!');
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

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Star Map</Text>
          <Text style={styles.subtitle}>
            Discover and complete star challenges
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                <View style={[styles.legendDot, { backgroundColor: colors.electricGreen }]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.electricBlue }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
                <Text style={styles.legendText}>Locked</Text>
              </View>
            </View>
          </NeoCard>
        </ScrollView>
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
  title: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
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
