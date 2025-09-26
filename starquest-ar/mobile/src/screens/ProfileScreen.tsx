import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const ProfileScreen: React.FC = () => {
  const { user, handleDisconnectWallet } = useGame();

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? You can reconnect anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: handleDisconnectWallet 
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your game data will be exported as a JSON file.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          }
        },
      ]
    );
  };

  const settingsOptions = [
    {
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: '🔔',
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon!'),
    },
    {
      title: 'AR Preferences',
      description: 'Configure AR camera settings',
      icon: '📱',
      onPress: () => Alert.alert('AR Settings', 'AR preferences coming soon!'),
    },
    {
      title: 'Privacy',
      description: 'Control your privacy settings',
      icon: '🔒',
      onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
    },
    {
      title: 'Support',
      description: 'Get help and contact support',
      icon: '❓',
      onPress: () => Alert.alert('Support', 'Contact support at help@starquest.com'),
    },
  ];

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.username}>{user?.username || 'Star Hunter'}</Text>
          <Text style={styles.walletAddress}>
            {user?.walletAddress || 'Guest User'}
          </Text>
        </View>

        {/* Stats Overview */}
        <NeoCard style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.stats.starsFound || 0}</Text>
              <Text style={styles.statLabel}>Stars Found</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.stats.questsCompleted || 0}</Text>
              <Text style={styles.statLabel}>Quests Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.stats.nftsEarned || 0}</Text>
              <Text style={styles.statLabel}>NFTs Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.stats.streak || 0}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </NeoCard>

        {/* Progress Section */}
        <NeoCard style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Star Collection</Text>
            <ProgressBar
              progress={user?.stats.starsFound || 0}
              maxProgress={12}
              color={colors.electricPurple}
            />
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Quest Mastery</Text>
            <ProgressBar
              progress={user?.stats.questsCompleted || 0}
              maxProgress={20}
              color={colors.electricGreen}
            />
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>NFT Collection</Text>
            <ProgressBar
              progress={user?.stats.nftsEarned || 0}
              maxProgress={50}
              color={colors.electricOrange}
            />
          </View>
        </NeoCard>

        {/* Achievements */}
        <NeoCard style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {user?.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>🏆</Text>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </NeoCard>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <Text style={styles.settingIcon}>{option.icon}</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <NeoCard style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <NeoButton
            title="Export My Data"
            onPress={handleExportData}
            variant="outline"
            style={styles.actionButton}
          />
          
          <NeoButton
            title="Disconnect Wallet"
            onPress={handleDisconnect}
            variant="outline"
            style={styles.actionButton}
          />
          
          <NeoButton
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="outline"
            style={[styles.actionButton, styles.dangerButton]}
          />
        </NeoCard>

        {/* App Info */}
        <NeoCard style={styles.infoCard}>
          <Text style={styles.appName}>StarQuest AR</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A gamified AR scavenger hunt with Web3 integration
          </Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.foreground,
    shadowColor: colors.foreground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  avatar: {
    fontSize: 40,
  },
  username: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
  },
  walletAddress: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  statsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  statNumber: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 24,
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
  achievementsCard: {
    marginBottom: 24,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  achievementText: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
  },
  settingsList: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    marginBottom: 8,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 4,
    fontWeight: '600',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.mutedForeground,
  },
  actionsCard: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  dangerButton: {
    borderColor: colors.error,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 8,
  },
  appVersion: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  appDescription: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
