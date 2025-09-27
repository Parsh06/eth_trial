import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width } = Dimensions.get('window');

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
      gradient: [colors.electricPurple, '#A855F7'],
      onPress: () => handleTabChange('map'),
    },
    {
      title: 'View Quests',
      description: 'Complete challenges',
      icon: '⚔️',
      gradient: [colors.electricGreen, '#059669'],
      onPress: () => handleTabChange('quests'),
    },
    {
      title: 'Leaderboard',
      description: 'See rankings',
      icon: '🏆',
      gradient: [colors.electricOrange, '#D97706'],
      onPress: () => handleTabChange('leaderboard'),
    },
    {
      title: 'Profile',
      description: 'View stats',
      icon: '👤',
      gradient: [colors.electricPink, '#DB2777'],
      onPress: () => handleTabChange('profile'),
    },
  ];

  const recentActivity = [
    { id: '1', action: 'Completed Alpha Star', time: '2 hours ago', icon: '⭐', color: colors.electricPurple },
    { id: '2', action: 'Earned Beta NFT', time: '1 day ago', icon: '🎁', color: colors.electricGreen },
    { id: '3', action: 'Streak: 5 days', time: '2 days ago', icon: '🔥', color: colors.electricOrange },
    { id: '4', action: 'New Quest Available', time: '3 days ago', icon: '⚔️', color: colors.electricPink },
  ];

  const achievements = [
    { id: '1', title: 'First Star', icon: '⭐', unlocked: true },
    { id: '2', title: 'Quest Master', icon: '⚔️', unlocked: true },
    { id: '3', title: 'NFT Collector', icon: '🎁', unlocked: false },
    { id: '4', title: 'Streak Master', icon: '🔥', unlocked: true },
  ];

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Background */}
        <LinearGradient
          colors={[colors.electricPurple, colors.electricPink, colors.electricOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>🌟 StarQuest AR</Text>
            <Text style={styles.heroSubtitle}>
              Welcome back, {user?.username || 'Star Hunter'}! 👋
            </Text>
            <Text style={styles.heroDescription}>
              Ready for your next cosmic adventure?
            </Text>
            {user?.walletAddress && (
              <Text style={styles.walletAddress}>
                Wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Stats Cards with Enhanced Design */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[colors.electricPurple, '#A855F7']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statNumber}>{completedStars}/{totalStars}</Text>
            <Text style={styles.statLabel}>Stars Found</Text>
            <View style={styles.statProgress}>
              <ProgressBar
                progress={completedStars}
                maxProgress={totalStars}
                color="#FFFFFF"
                size="small"
              />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.electricGreen, '#059669']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statIcon}>⚔️</Text>
            <Text style={styles.statNumber}>{completedQuests}/{totalQuests}</Text>
            <Text style={styles.statLabel}>Quests Done</Text>
            <View style={styles.statProgress}>
              <ProgressBar
                progress={completedQuests}
                maxProgress={totalQuests}
                color="#FFFFFF"
                size="small"
              />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={[colors.electricOrange, '#D97706']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statIcon}>🎁</Text>
            <Text style={styles.statNumber}>{user?.stats.nftsEarned || 0}</Text>
            <Text style={styles.statLabel}>NFTs Earned</Text>
            <View style={styles.statProgress}>
              <ProgressBar
                progress={user?.stats.nftsEarned || 0}
                maxProgress={10}
                color="#FFFFFF"
                size="small"
              />
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Progress Section */}
        <NeoCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((completedStars / Math.max(totalStars, 1)) * 100)}%
            </Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressItemHeader}>
              <Text style={styles.progressLabel}>Star Collection</Text>
              <Text style={styles.progressValue}>{completedStars}/{totalStars}</Text>
            </View>
            <ProgressBar
              progress={completedStars}
              maxProgress={totalStars}
              color={colors.electricPurple}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressItemHeader}>
              <Text style={styles.progressLabel}>Quest Completion</Text>
              <Text style={styles.progressValue}>{completedQuests}/{totalQuests}</Text>
            </View>
            <ProgressBar
              progress={completedQuests}
              maxProgress={totalQuests}
              color={colors.electricGreen}
            />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressItemHeader}>
              <Text style={styles.progressLabel}>Current Streak</Text>
              <Text style={styles.progressValue}>{user?.stats.streak || 0}/30 days</Text>
            </View>
            <ProgressBar
              progress={user?.stats.streak || 0}
              maxProgress={30}
              color={colors.electricOrange}
            />
          </View>
        </NeoCard>

        {/* Enhanced Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.gradient as [string, string]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsContainer}>
          {achievements.map((achievement) => (
            <NeoCard
              key={achievement.id}
              style={[
                styles.achievementCard,
                { opacity: achievement.unlocked ? 1 : 0.5 }
              ] as any}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              {achievement.unlocked && (
                <Text style={styles.achievementBadge}>✓</Text>
              )}
            </NeoCard>
          ))}
        </View>

        {/* Enhanced Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <NeoCard style={styles.activityCard}>
          {recentActivity.map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: activity.color }]}>
                <Text style={styles.activityIcon}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
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
    backgroundColor: colors.background,
  },
  heroSection: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  walletAddress: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.electricPurple,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    width: (width - 64) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 2,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: colors.electricGreen,
    fontWeight: 'bold',
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 4,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.muted,
    marginLeft: 56,
    marginVertical: 8,
  },
});