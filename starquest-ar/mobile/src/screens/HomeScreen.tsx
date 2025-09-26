import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const HomeScreen: React.FC = () => {
  const { user, stars, quests, handleTabChange, handleChallengeSelect } = useGame();

  const completedStars = stars.filter(star => star.status === 'completed').length;
  const totalStars = stars.length;
  const completedQuests = quests.filter(quest => quest.completed).length;
  const totalQuests = quests.length;

  const quickActions = [
    {
      title: 'Explore Map',
      description: 'Find new stars',
      icon: '🗺️',
      color: colors.electricPurple,
      onPress: () => handleTabChange('map'),
    },
    {
      title: 'View Quests',
      description: 'Complete challenges',
      icon: '⚔️',
      color: colors.electricGreen,
      onPress: () => handleTabChange('quests'),
    },
    {
      title: 'Leaderboard',
      description: 'See rankings',
      icon: '🏆',
      color: colors.electricOrange,
      onPress: () => handleTabChange('leaderboard'),
    },
  ];

  const recentActivity = [
    { id: '1', action: 'Completed Alpha Star', time: '2 hours ago', icon: '⭐' },
    { id: '2', action: 'Earned Beta NFT', time: '1 day ago', icon: '🎁' },
    { id: '3', action: 'Streak: 5 days', time: '2 days ago', icon: '🔥' },
  ];

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.username || 'Star Hunter'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Ready for your next adventure?
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <NeoCard style={[styles.statCard, { backgroundColor: colors.electricPurple }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statNumber}>{completedStars}/{totalStars}</Text>
            <Text style={styles.statLabel}>Stars Found</Text>
          </NeoCard>

          <NeoCard style={[styles.statCard, { backgroundColor: colors.electricGreen }]}>
            <Text style={styles.statIcon}>⚔️</Text>
            <Text style={styles.statNumber}>{completedQuests}/{totalQuests}</Text>
            <Text style={styles.statLabel}>Quests Done</Text>
          </NeoCard>

          <NeoCard style={[styles.statCard, { backgroundColor: colors.electricOrange }]}>
            <Text style={styles.statIcon}>🎁</Text>
            <Text style={styles.statNumber}>{user?.stats.nftsEarned || 0}</Text>
            <Text style={styles.statLabel}>NFTs Earned</Text>
          </NeoCard>
        </View>

        {/* Progress Section */}
        <NeoCard style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Star Collection</Text>
            <ProgressBar
              progress={completedStars}
              maxProgress={totalStars}
              color={colors.electricPurple}
            />
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Quest Completion</Text>
            <ProgressBar
              progress={completedQuests}
              maxProgress={totalQuests}
              color={colors.electricGreen}
            />
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Current Streak</Text>
            <ProgressBar
              progress={user?.stats.streak || 0}
              maxProgress={30}
              color={colors.electricOrange}
            />
          </View>
        </NeoCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <NeoCard
              key={index}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </NeoCard>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <NeoCard style={styles.activityCard}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
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
  welcomeText: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    ...typography.brutalMedium,
    color: colors.primaryForeground,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.primaryForeground,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 8,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTitle: {
    ...typography.brutalSmall,
    color: colors.primaryForeground,
    marginBottom: 4,
  },
  actionDescription: {
    ...typography.bodySmall,
    color: colors.primaryForeground,
  },
  activityCard: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 4,
  },
  activityTime: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
});
