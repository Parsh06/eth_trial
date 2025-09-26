import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { Quest } from '../types';

export const QuestListScreen: React.FC = () => {
  const { quests, handleChallengeSelect } = useGame();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'daily' | 'weekly' | 'epic'>('all');

  const filteredQuests = quests.filter(quest => 
    selectedFilter === 'all' || quest.type === selectedFilter
  );

  const getQuestColor = (type: Quest['type']) => {
    switch (type) {
      case 'daily':
        return colors.electricGreen;
      case 'weekly':
        return colors.electricPurple;
      case 'epic':
        return colors.electricOrange;
      default:
        return colors.foreground;
    }
  };

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'expert':
        return colors.error;
      case 'intermediate':
        return colors.warning;
      case 'beginner':
        return colors.success;
      default:
        return colors.foreground;
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleQuestPress = (quest: Quest) => {
    if (quest.completed) return;
    
    // Find a related challenge or create a mock one
    const challengeId = `challenge-${quest.id}`;
    handleChallengeSelect(challengeId);
  };

  const renderQuestCard = (quest: Quest) => (
    <NeoCard
      key={quest.id}
      style={[
        styles.questCard,
        quest.completed && styles.completedQuest,
      ]}
      onPress={() => handleQuestPress(quest)}
    >
      <View style={styles.questHeader}>
        <View style={styles.questTitleContainer}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getQuestColor(quest.type) }]}>
            <Text style={styles.typeText}>{quest.type.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) }]}>
          <Text style={styles.difficultyText}>{quest.difficulty.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.questDescription}>{quest.description}</Text>

      <View style={styles.questProgress}>
        <Text style={styles.progressLabel}>
          Progress: {quest.progress}/{quest.maxProgress}
        </Text>
        <ProgressBar
          progress={quest.progress}
          maxProgress={quest.maxProgress}
          color={getQuestColor(quest.type)}
        />
      </View>

      <View style={styles.questInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Reward</Text>
          <Text style={styles.infoValue}>
            {quest.rewards.points} points
            {quest.rewards.nftId && ' + NFT'}
          </Text>
        </View>
        
        {quest.timeRemaining && (
          <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time Left</Text>
          <Text style={styles.infoValue}>
            {formatTimeRemaining(quest.timeRemaining)}
          </Text>
        </View>
        )}
      </View>

      {quest.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✅ COMPLETED</Text>
        </View>
      )}
    </NeoCard>
  );

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quests</Text>
          <Text style={styles.subtitle}>
            Complete challenges to earn rewards and progress
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['all', 'daily', 'weekly', 'epic'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}>
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quest Stats */}
        <NeoCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {quests.filter(q => q.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {quests.filter(q => !q.completed).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {quests.reduce((sum, q) => sum + q.rewards.points, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
          </View>
        </NeoCard>

        {/* Quest List */}
        <View style={styles.questList}>
          {filteredQuests.length > 0 ? (
            filteredQuests.map(renderQuestCard)
          ) : (
            <NeoCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Quests Available</Text>
              <Text style={styles.emptyDescription}>
                Check back later for new quests!
              </Text>
            </NeoCard>
          )}
        </View>
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.primaryForeground,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  questList: {
    gap: 16,
  },
  questCard: {
    padding: 16,
  },
  completedQuest: {
    opacity: 0.7,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  questTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignSelf: 'flex-start',
  },
  typeText: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontWeight: '700',
    fontSize: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontWeight: '700',
    fontSize: 10,
  },
  questDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 16,
  },
  questProgress: {
    marginBottom: 16,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.foreground,
    marginBottom: 8,
    fontWeight: '600',
  },
  questInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.foreground,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: colors.success,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  completedText: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
