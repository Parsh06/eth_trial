import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoButton } from '../components/ui/NeoButton';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const ProfileScreen: React.FC = () => {
  console.log('🏠 ProfileScreen: Rendering simple version');

  const handleWalletAction = () => {
    Alert.alert('Wallet Action', 'This feature is coming soon!');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature is coming soon!');
  };

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.username}>StarQuest User</Text>
          <Text style={styles.subtitle}>Cosmic Explorer</Text>
        </View>

        {/* Stats Card */}
        <NeoCard style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Stars Found</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Quests Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>NFTs Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </NeoCard>

        {/* Wallet Info Card */}
        <NeoCard style={styles.walletCard}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.infoValue}>Connected</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Network:</Text>
            <Text style={styles.infoValue}>Ethereum Mainnet</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              0x1234...5678
            </Text>
          </View>
        </NeoCard>

        {/* Actions */}
        <NeoCard style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <NeoButton
            title="Wallet Settings"
            onPress={handleWalletAction}
            variant="outline"
            style={styles.actionButton}
          />
          
          <NeoButton
            title="Export Game Data"
            onPress={handleExportData}
            variant="outline"
            style={styles.actionButton}
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
  },
  avatar: {
    fontSize: 40,
    color: colors.foreground,
  },
  username: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
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
  walletCard: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    ...typography.body,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body,
    color: colors.foreground,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.electricGreen,
    marginRight: 6,
  },
  actionsCard: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
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
    lineHeight: 20,
  },
});
