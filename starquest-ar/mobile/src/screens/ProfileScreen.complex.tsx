import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAccount, useBalance, useEnsName, useEnsAvatar, useDisconnect } from 'wagmi';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ProfileScreenContent: React.FC = () => {
  console.log('📱 ProfileScreenContent: Starting to render...');
  
  // Get game context with null check
  const gameContext = useGame();
  if (!gameContext) {
    console.error('❌ ProfileScreenContent: GameContext is null');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Game context not available</Text>
      </View>
    );
  }
  
  const { user, state, handleDisconnectWallet } = gameContext;
  console.log('✅ ProfileScreenContent: GameContext loaded, state:', state?.screen);

  // Get wagmi hooks safely
  let address, isConnected, chain, disconnect, balance, balanceLoading, balanceError, ensName, ensLoading;
  
  try {
    const accountData = useAccount();
    address = accountData.address;
    isConnected = accountData.isConnected;
    chain = accountData.chain;
    
    const disconnectData = useDisconnect();
    disconnect = disconnectData.disconnect;
    
    const balanceData = useBalance({
      address: address,
    });
    balance = balanceData.data;
    balanceLoading = balanceData.isLoading;
    balanceError = balanceData.error;
    
    const ensData = useEnsName({
      address: address,
    });
    ensName = ensData.data;
    ensLoading = ensData.isLoading;
    
    console.log('✅ ProfileScreenContent: Wagmi hooks loaded safely');
  } catch (hookError) {
    console.error('❌ ProfileScreenContent: Error with wagmi hooks:', hookError);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Wallet hooks not available</Text>
        <Text style={styles.errorText}>Please ensure wallet is properly connected</Text>
      </View>
    );
  }
  
  console.log('✅ Profile data loaded:', {
    hasUser: !!user,
    isConnected,
    hasAddress: !!address,
    hasBalance: !!balance,
    screen: state?.screen
  });

  // Handle wallet disconnect
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔌 ProfileScreen: Disconnecting wallet...');
              disconnect();
              await handleDisconnectWallet();
              console.log('✅ ProfileScreen: Wallet disconnected successfully');
            } catch (error) {
              console.error('❌ ProfileScreen: Error disconnecting:', error);
              Alert.alert('Error', 'Failed to disconnect wallet properly');
            }
          },
        },
      ]
    );
  };

  console.log('📱 ProfileScreenContent: About to render full UI');

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👤</Text>
            </View>
            
            <Text style={styles.username}>
              {ensName || user?.username || 'StarQuest User'}
            </Text>
            
            {address && (
              <Text style={styles.walletAddress}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </Text>
            )}
            
            {/* Wallet Balance */}
            {balanceLoading ? (
              <ActivityIndicator size="small" color={colors.electricPurple} style={styles.balanceLoader} />
            ) : balanceError ? (
              <Text style={styles.errorText}>Failed to load balance</Text>
            ) : balance ? (
              <Text style={styles.walletBalance}>
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </Text>
            ) : null}
            
            {/* Connection Status */}
            <View style={styles.connectionStatus}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: isConnected ? colors.electricGreen : colors.error }
              ]} />
              <Text style={styles.statusText}>
                {isConnected ? 
                  `Connected to ${chain?.name || 'Network'}` : 
                  'Wallet Disconnected'
                }
              </Text>
            </View>
          </View>

          {/* User Stats */}
          {user && (
            <NeoCard style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Your Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.stats?.starsFound || 0}</Text>
                  <Text style={styles.statLabel}>Stars Found</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.stats?.questsCompleted || 0}</Text>
                  <Text style={styles.statLabel}>Quests Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.stats?.nftsEarned || 0}</Text>
                  <Text style={styles.statLabel}>NFTs Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.stats?.streak || 0}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
              </View>
            </NeoCard>
          )}
          
          {/* Wallet Info Card */}
          {isConnected && (
            <NeoCard style={styles.walletCard}>
              <Text style={styles.sectionTitle}>Wallet Information</Text>
              <View style={styles.walletInfoItem}>
                <Text style={styles.walletInfoLabel}>Network:</Text>
                <Text style={styles.walletInfoValue}>{chain?.name || 'Unknown'}</Text>
              </View>
              <View style={styles.walletInfoItem}>
                <Text style={styles.walletInfoLabel}>Chain ID:</Text>
                <Text style={styles.walletInfoValue}>{chain?.id || 'N/A'}</Text>
              </View>
              <View style={styles.walletInfoItem}>
                <Text style={styles.walletInfoLabel}>Address:</Text>
                <Text style={styles.walletInfoValue} numberOfLines={1}>
                  {address}
                </Text>
              </View>
              {ensName && (
                <View style={styles.walletInfoItem}>
                  <Text style={styles.walletInfoLabel}>ENS Name:</Text>
                  <Text style={styles.walletInfoValue}>{ensName}</Text>
                </View>
              )}
            </NeoCard>
          )}
          
          {/* Actions */}
          <NeoCard style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            
            {isConnected && (
              <NeoButton
                title="Disconnect Wallet"
                onPress={handleDisconnect}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            
            <NeoButton
              title="Export Game Data"
              onPress={() => Alert.alert('Export Data', 'Feature coming soon!')}
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

// Main ProfileScreen component with error boundary
export const ProfileScreen: React.FC = () => {
  console.log('🏠 ProfileScreen: Main component rendering');
  return (
    <ErrorBoundary>
      <ProfileScreenContent />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: 16,
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
  walletAddress: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  walletBalance: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  balanceLoader: {
    marginBottom: 12,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...typography.caption,
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
  walletCard: {
    marginBottom: 24,
  },
  walletInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletInfoLabel: {
    ...typography.body,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  walletInfoValue: {
    ...typography.body,
    color: colors.foreground,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
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
