import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';
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
  const { walletState, formatAddress, getNetworkName } = useWallet();
  
  // Destructure wallet state
  const { isConnected, address, balance, chainId } = walletState;

  const completedStars = stars.filter((star) => star.status === 'completed').length;
  const totalStars = stars.length;
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const totalQuests = quests.length;

  console.log('🏠 HomeScreen: Wallet data', { isConnected, hasBalance: !!balance, chainId });

  const quickActions = [
    {
      title: 'Explore Map',
      description: 'Find new stars',
      icon: '🗺️',
      gradient: [colors.electricPurple, colors.electricPink],
      onPress: () => handleTabChange('map'),
    },
    {
      title: 'View Quests',
      description: 'Complete challenges',
      icon: '⚔️',
      gradient: [colors.electricGreen, colors.electricCyan],
      onPress: () => handleTabChange('quests'),
    },
    {
      title: 'Leaderboard',
      description: 'See rankings',
      icon: '🏆',
      gradient: [colors.electricOrange, colors.electricYellow],
      onPress: () => handleTabChange('leaderboard'),
    },
    {
      title: 'Profile',
      description: 'View stats',
      icon: '👤',
      gradient: [colors.electricBlue, colors.electricPurple],
      onPress: () => handleTabChange('profile'),
    },
  ];

  const achievements = [
    { title: 'First Star', icon: '⭐', unlocked: true },
    { title: 'Explorer', icon: '🗺️', unlocked: completedStars > 0 },
    { title: 'Quest Master', icon: '⚔️', unlocked: completedQuests > 0 },
    { title: 'Collector', icon: '💎', unlocked: completedStars > 5 },
  ];

  const recentActivity = [
    { title: 'Discovered new star', time: '2 hours ago', icon: '⭐' },
    { title: 'Completed quest', time: '1 day ago', icon: '⚔️' },
    { title: 'Level up!', time: '2 days ago', icon: '🎉' },
  ];

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.electricPurple, colors.electricPink, colors.electricOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome back!</Text>
            <Text style={styles.heroSubtitle}>
              {user?.username || 'StarHunter'}
            </Text>
            <Text style={styles.heroDescription}>
              Ready for your next cosmic adventure?
            </Text>
            
            {/* Wallet Information */}
            {isConnected && address && (
              <View style={styles.walletInfo}>
                <Text style={styles.walletAddress}>
                  {formatAddress(address)}
                </Text>
                {balance && (
                  <Text style={styles.walletBalance}>
                    {balance} ETH
                  </Text>
                )}
                {chainId && (
                  <Text style={styles.networkInfo}>
                    🔗 Connected to {getNetworkName(chainId)}
                  </Text>
                )}
              </View>
            )}
            
            {!isConnected && (
              <Text style={styles.disconnectedText}>
                ⚠️ Wallet not connected
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <NeoCard style={styles.statCard}>
            <Text style={styles.statValue}>{completedStars}</Text>
            <Text style={styles.statLabel}>Stars Found</Text>
          </NeoCard>
          <NeoCard style={styles.statCard}>
            <Text style={styles.statValue}>{completedQuests}</Text>
            <Text style={styles.statLabel}>Quests Done</Text>
          </NeoCard>
          <NeoCard style={styles.statCard}>
            <Text style={styles.statValue}>{user?.stats?.nftsEarned || 0}</Text>
            <Text style={styles.statLabel}>NFTs Earned</Text>
          </NeoCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <NeoCard style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Stars Collection</Text>
              <ProgressBar
                progress={totalStars > 0 ? completedStars / totalStars : 0}
                variant="default"
                size="large"
                maxProgress={1}
              />
              <Text style={styles.progressText}>
                {completedStars} of {totalStars} stars
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Quest Completion</Text>
              <ProgressBar
                progress={totalQuests > 0 ? completedQuests / totalQuests : 0}
                variant="success"
                size="large"
                maxProgress={1}
              />
              <Text style={styles.progressText}>
                {completedQuests} of {totalQuests} quests
              </Text>
            </View>
          </NeoCard>
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <NeoCard style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeIcon}>🎯</Text>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeTitle}>Find 3 Stars Today</Text>
                <Text style={styles.challengeDescription}>
                  Complete this daily challenge to earn bonus rewards!
                </Text>
              </View>
            </View>
            <NeoButton
              title="Start Challenge"
              onPress={() => handleChallengeSelect('daily')}
              variant="gradient"
              gradient={[colors.electricGreen, colors.electricCyan]}
              size="large"
              style={styles.challengeButton}
            />
          </NeoCard>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <NeoCard
                key={index}
                style={{
                  ...styles.achievementCard,
                  opacity: achievement.unlocked ? 1 : 0.5,
                }}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </NeoCard>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity, index) => (
            <NeoCard key={index} style={styles.activityItem}>
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </NeoCard>
          ))}
        </View>

        {/* Featured Stars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Stars</Text>
          <NeoCard style={styles.featuredCard}>
            <Text style={styles.featuredTitle}>🌟 Rare Star Spotted!</Text>
            <Text style={styles.featuredDescription}>
              A legendary star has been discovered in your area. Use AR to find it
              and claim exclusive rewards!
            </Text>
            <NeoButton
              title="Find Star"
              onPress={() => handleTabChange('map')}
              variant="gradient"
              gradient={[colors.electricPurple, colors.electricPink]}
              size="medium"
              style={styles.featuredButton}
            />
          </NeoCard>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroSection: {
    margin: 20,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    elevation: 12,
  },
  heroContent: { alignItems: 'center' },
  heroTitle: {
    ...typography.heading1,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.heading3,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroDescription: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  walletInfo: {
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  walletAddress: {
    ...typography.caption,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletBalance: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.95,
  },
  networkInfo: {
    ...typography.caption,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  balanceLoader: {
    marginVertical: 4,
  },
  disconnectedText: {
    ...typography.caption,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  statCard: { flex: 1, alignItems: 'center', padding: 20, minHeight: 80 },
  statValue: {
    ...typography.brutalMedium,
    color: colors.electricPurple,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: { marginBottom: 32, paddingHorizontal: 20 },
  sectionTitle: {
    ...typography.heading2,
    color: colors.foreground,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    width: (width - 72) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 36, marginBottom: 12, textAlign: 'center' },
  actionTitle: {
    ...typography.heading3,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  actionDescription: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  progressCard: { padding: 24 },
  progressItem: { marginBottom: 20 },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressText: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 8,
    textAlign: 'center',
  },
  challengeCard: { padding: 24 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  challengeIcon: { fontSize: 32, marginRight: 16 },
  challengeContent: { flex: 1 },
  challengeTitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 4,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  challengeButton: { width: '100%' },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  achievementCard: {
    width: (width - 72) / 2,
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    marginBottom: 16,
  },
  achievementIcon: { fontSize: 32, marginBottom: 12, textAlign: 'center' },
  achievementTitle: {
    ...typography.bodySmall,
    color: colors.foreground,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  activityIcon: { fontSize: 28, marginRight: 16 },
  activityContent: { flex: 1 },
  activityTitle: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: { ...typography.caption, color: colors.mutedForeground },
  featuredCard: {
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.electricPurple,
  },
  featuredTitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 8,
  },
  featuredDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 20,
    lineHeight: 22,
  },
  featuredButton: { width: '100%' },
  bottomSpacing: { height: 100 },
});
