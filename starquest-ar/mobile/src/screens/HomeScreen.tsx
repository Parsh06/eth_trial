import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { starQuestService } from '../services/StarQuestService';

const { width, height } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { user, stars, quests, handleTabChange, handleChallengeSelect, createStake, getContractStats } = useGame();
  const [contractStats, setContractStats] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [stakingAmount, setStakingAmount] = useState<string>('0.1');
  const [selectedStar, setSelectedStar] = useState<number>(0);

  const completedStars = stars.filter(star => star.status === 'completed').length;
  const totalStars = stars.length;
  const completedQuests = quests.filter(quest => quest.completed).length;
  const totalQuests = quests.length;

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      const address = await starQuestService.getWalletAddress();
      if (address) {
        setWalletAddress(address);
        const balance = await starQuestService.getBalance();
        setBalance(balance);
      }
      
      const stats = await getContractStats();
      setContractStats(stats);
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    }
  };

  const handleCreateStake = async () => {
    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid staking amount');
      return;
    }

    try {
      const result = await createStake(selectedStar, stakingAmount);
      if (result.success) {
        Alert.alert('Success!', `Stake created successfully! Transaction: ${result.hash?.slice(0, 10)}...`);
        await loadBlockchainData();
      } else {
        Alert.alert('Error', result.error || 'Failed to create stake');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create stake');
    }
  };

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
            <Text style={styles.heroSubtitle}>{user?.username || 'StarHunter'}</Text>
            <Text style={styles.heroDescription}>
              Ready for your next cosmic adventure?
            </Text>
            {user?.walletAddress && (
              <Text style={styles.walletAddress}>
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
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
                style={{ ...styles.achievementCard, opacity: achievement.unlocked ? 1 : 0.5 }}
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
              A legendary star has been discovered in your area. 
              Use AR to find it and claim exclusive rewards!
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

        {/* Blockchain Section */}
        {walletAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 StarQuest Blockchain</Text>
            
            {/* Wallet Info */}
            <NeoCard style={styles.blockchainCard}>
              <Text style={styles.blockchainTitle}>Wallet Connected</Text>
              <Text style={styles.walletInfo}>
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </Text>
              <Text style={styles.balanceInfo}>Balance: {balance} HBAR</Text>
            </NeoCard>

            {/* Contract Stats */}
            {contractStats && (
              <NeoCard style={styles.blockchainCard}>
                <Text style={styles.blockchainTitle}>Contract Statistics</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>Total Stars: {contractStats.totalStars}</Text>
                  <Text style={styles.statText}>Total Staked: {contractStats.totalStaked} HBAR</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>Total Players: {contractStats.totalPlayers}</Text>
                  <Text style={styles.statText}>Status: {contractStats.isPaused ? 'Paused' : 'Active'}</Text>
                </View>
              </NeoCard>
            )}

            {/* Staking Section */}
            <NeoCard style={styles.stakingCard}>
              <Text style={styles.blockchainTitle}>Create Stake</Text>
              <Text style={styles.stakingDescription}>
                Stake HBAR on a star to participate in challenges and earn rewards
              </Text>
              
              <View style={styles.stakingForm}>
                <Text style={styles.formLabel}>Select Star:</Text>
                <View style={styles.starSelector}>
                  {stars.slice(0, 4).map((star, index) => (
                    <TouchableOpacity
                      key={star.id}
                      style={[
                        styles.starOption,
                        selectedStar === index && styles.starOptionSelected
                      ]}
                      onPress={() => setSelectedStar(index)}
                    >
                      <Text style={styles.starOptionText}>Star {index}</Text>
                      {star.blockchainData && (
                        <Text style={styles.starOptionPayout}>
                          {star.blockchainData.basePayout} HBAR
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Stake Amount (HBAR):</Text>
                <TextInput
                  style={styles.amountInput}
                  value={stakingAmount}
                  onChangeText={setStakingAmount}
                  placeholder="0.1"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />

                <NeoButton
                  title="Create Stake"
                  onPress={handleCreateStake}
                  variant="gradient"
                  gradient={[colors.electricGreen, colors.electricCyan]}
                  size="large"
                  style={styles.stakeButton}
                />
              </View>
            </NeoCard>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    elevation: 12,
  },
  heroContent: {
    alignItems: 'center',
  },
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
  walletAddress: {
    ...typography.caption,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 12,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
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
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
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
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    elevation: 12,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 12,
    textAlign: 'center',
  },
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
  progressCard: {
    padding: 24,
  },
  progressItem: {
    marginBottom: 20,
  },
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
  challengeCard: {
    padding: 24,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  challengeContent: {
    flex: 1,
  },
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
  challengeButton: {
    width: '100%',
  },
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
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
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
  activityIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
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
  featuredButton: {
    width: '100%',
  },
  // Blockchain Styles
  blockchainCard: {
    backgroundColor: colors.electricPurple + '10',
    borderColor: colors.electricPurple,
    borderWidth: 1,
    marginBottom: 16,
  },
  blockchainTitle: {
    ...typography.brutalSmall,
    color: colors.electricPurple,
    marginBottom: 12,
    textAlign: 'center',
  },
  walletInfo: {
    ...typography.body,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  balanceInfo: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    flex: 1,
  },
  stakingCard: {
    backgroundColor: colors.electricGreen + '10',
    borderColor: colors.electricGreen,
    borderWidth: 1,
  },
  stakingDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  stakingForm: {
    gap: 16,
  },
  formLabel: {
    ...typography.brutalSmall,
    color: colors.foreground,
  },
  starSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starOption: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  starOptionSelected: {
    backgroundColor: colors.electricGreen + '20',
    borderColor: colors.electricGreen,
  },
  starOptionText: {
    ...typography.bodySmall,
    color: colors.foreground,
    marginBottom: 4,
  },
  starOptionPayout: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  amountInput: {
    ...typography.body,
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: colors.foreground,
  },
  stakeButton: {
    width: '100%',
  },
  bottomSpacing: {
    height: 100,
  },
});