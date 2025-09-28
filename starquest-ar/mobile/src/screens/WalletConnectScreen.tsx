import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useWallet } from '../context/WalletContext';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const WalletConnectScreen: React.FC = () => {
  const { handleWalletConnect } = useGame();
  const { walletState, isLoading, connect } = useWallet();

  const handleConnectWallet = async () => {
    try {
      const success = await connect();
      if (success && walletState.address) {
        // Connection successful, trigger game context update
        handleWalletConnect(walletState.address);
      } else {
        Alert.alert(
          'Connection Failed',
          walletState.error || 'Failed to connect wallet. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Wallet connection error:', error);
      Alert.alert(
        'Connection Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle successful connection
  React.useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      console.log('✅ Wallet connected:', walletState.address);
      handleWalletConnect(walletState.address);
    }
  }, [walletState.isConnected, walletState.address, handleWalletConnect]);

  const handleGuestMode = () => {
    Alert.alert(
      'Guest Mode',
      'You can play as a guest, but you won\'t be able to collect NFTs or participate in the leaderboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue as Guest', 
          onPress: () => handleWalletConnect('guest')
        },
      ]
    );
  };

  return (
    <MobileLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.subtitle}>
            Link your Web3 wallet to start collecting NFTs and join the leaderboard
          </Text>
        </View>

        <View style={styles.content}>
          {/* QR Code Placeholder */}
          <NeoCard style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrIcon}>📱</Text>
              <Text style={styles.qrText}>QR Code Scanner</Text>
              <Text style={styles.qrDescription}>
                Scan with your wallet app to connect
              </Text>
            </View>
          </NeoCard>

          {/* Wallet Options */}
          <View style={styles.optionsContainer}>
            <NeoButton
              title="Connect Wallet"
              onPress={handleConnectWallet}
              variant="electric"
              size="lg"
              loading={isLoading}
              style={styles.connectButton}
            />

            <NeoButton
              title="Continue as Guest"
              onPress={handleGuestMode}
              variant="outline"
              size="lg"
              style={styles.guestButton}
            />
          </View>

          {/* MetaMask Info */}
          <NeoCard style={styles.supportedCard}>
            <Text style={styles.supportedTitle}>About MetaMask</Text>
            <View style={styles.walletList}>
              <Text style={styles.walletItem}>🦊 The most trusted Web3 wallet</Text>
              <Text style={styles.walletItem}>🔒 Your keys, your crypto</Text>
              <Text style={styles.walletItem}>🚀 Over 30 million users worldwide</Text>
              <Text style={styles.walletItem}>💫 Direct connection - no intermediaries</Text>
            </View>
          </NeoCard>
        </View>
      </View>
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
    marginBottom: 40,
  },
  title: {
    ...typography.brutalLarge,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: 24,
  },
  qrCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.muted,
  },
  qrPlaceholder: {
    alignItems: 'center',
  },
  qrIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  qrText: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 8,
  },
  qrDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  connectButton: {
    marginBottom: 8,
  },
  guestButton: {
    marginBottom: 8,
  },
  supportedCard: {
    backgroundColor: colors.muted,
  },
  supportedTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  walletList: {
    gap: 8,
  },
  walletItem: {
    ...typography.body,
    color: colors.mutedForeground,
  },
});
