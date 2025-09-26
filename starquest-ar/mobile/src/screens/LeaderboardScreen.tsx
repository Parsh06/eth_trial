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
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { LeaderboardEntry } from '../types';

export const LeaderboardScreen: React.FC = () => {
  const { leaderboard, user } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<'stars' | 'nfts' | 'streaks'>('stars');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return colors.electricOrange;
      case 2:
        return colors.mutedForeground;
      case 3:
        return colors.electricPurple;
      default:
        return colors.foreground;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stars':
        return '⭐';
      case 'nfts':
        return '🎁';
      case 'streaks':
        return '🔥';
      default:
        return '🏆';
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.user.id === user?.id;
    
    return (
      <NeoCard
        key={entry.rank}
        style={[
          styles.entryCard,
          isCurrentUser && styles.currentUserCard,
        ]}
      >
        <View style={styles.entryHeader}>
          <View style={styles.rankContainer}>
            <Text style={[
              styles.rankIcon,
              { color: getRankColor(entry.rank) }
            ]}>
              {getRankIcon(entry.rank)}
            </Text>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[
              styles.username,
              isCurrentUser && styles.currentUserText,
            ]}>
              {entry.user.username}
              {isCurrentUser && ' (You)'}
            </Text>
            <Text style={styles.walletAddress}>
              {entry.user.walletAddress || 'Guest User'}
            </Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.score,
              isCurrentUser && styles.currentUserText,
            ]}>
              {entry.score.toLocaleString()}
            </Text>
            <Text style={styles.scoreLabel}>
              {getCategoryIcon(selectedCategory)}
            </Text>
          </View>
        </View>

        {entry.user.achievements && entry.user.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementsLabel}>Achievements:</Text>
            <View style={styles.achievementsList}>
              {entry.user.achievements.slice(0, 3).map((achievement, idx) => (
                <View key={idx} style={styles.achievementBadge}>
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </NeoCard>
    );
  };

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>
            See how you rank against other star hunters
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          {(['stars', 'nfts', 'streaks'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.activeCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryIcon,
                selectedCategory === category && styles.activeCategoryIcon,
              ]}>
                {getCategoryIcon(category)}
              </Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText,
              ]}>
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Stats */}
        {user && (
          <NeoCard style={styles.userStatsCard}>
            <Text style={styles.userStatsTitle}>Your Stats</Text>
            <View style={styles.userStatsRow}>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatNumber}>{user.stats.starsFound}</Text>
                <Text style={styles.userStatLabel}>Stars</Text>
              </View>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatNumber}>{user.stats.nftsEarned}</Text>
                <Text style={styles.userStatLabel}>NFTs</Text>
              </View>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatNumber}>{user.stats.streak}</Text>
                <Text style={styles.userStatLabel}>Streak</Text>
              </View>
            </View>
          </NeoCard>
        )}

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>
            Top {selectedCategory.toUpperCase()} Hunters
          </Text>
          
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => renderLeaderboardEntry(entry, index))
          ) : (
            <NeoCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Rankings Yet</Text>
              <Text style={styles.emptyDescription}>
                Complete some challenges to appear on the leaderboard!
              </Text>
            </NeoCard>
          )}
        </View>

        {/* Challenge Others */}
        <NeoCard style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Challenge Others</Text>
          <Text style={styles.challengeDescription}>
            Challenge your friends to beat your score and climb the leaderboard!
          </Text>
          <NeoButton
            title="Send Challenge"
            onPress={() => {}}
            variant="electric"
            style={styles.challengeButton}
          />
        </NeoCard>
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
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    backgroundColor: colors.background,
  },
  activeCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeCategoryIcon: {
    color: colors.primaryForeground,
  },
  categoryText: {
    ...typography.caption,
    color: colors.foreground,
    fontWeight: '700',
  },
  activeCategoryText: {
    color: colors.primaryForeground,
  },
  userStatsCard: {
    marginBottom: 24,
  },
  userStatsTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatNumber: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 4,
  },
  userStatLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  leaderboardContainer: {
    marginBottom: 24,
  },
  leaderboardTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  entryCard: {
    marginBottom: 12,
  },
  currentUserCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankIcon: {
    ...typography.brutalMedium,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  username: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 4,
  },
  currentUserText: {
    color: colors.primaryForeground,
  },
  walletAddress: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 16,
  },
  achievementsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.muted,
  },
  achievementsLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  achievementBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  achievementText: {
    ...typography.caption,
    color: colors.foreground,
    fontSize: 10,
    fontWeight: '600',
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
  challengeCard: {
    marginBottom: 24,
  },
  challengeTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 8,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 16,
  },
  challengeButton: {
    marginTop: 8,
  },
});
