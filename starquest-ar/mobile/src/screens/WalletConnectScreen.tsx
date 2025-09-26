import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const WalletConnectScreen: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { handleWalletConnect } = useGame();

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = '0x1234...5678';
      handleWalletConnect(mockAddress);
      setIsConnecting(false);
    }, 2000);
  };

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
              loading={isConnecting}
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

          {/* Supported Wallets */}
          <NeoCard style={styles.supportedCard}>
            <Text style={styles.supportedTitle}>Supported Wallets</Text>
            <View style={styles.walletList}>
              <Text style={styles.walletItem}>• MetaMask</Text>
              <Text style={styles.walletItem}>• WalletConnect</Text>
              <Text style={styles.walletItem}>• Coinbase Wallet</Text>
              <Text style={styles.walletItem}>• Trust Wallet</Text>
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
