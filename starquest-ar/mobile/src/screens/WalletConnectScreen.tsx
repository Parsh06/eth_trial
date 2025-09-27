import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { starQuestService } from '../services/StarQuestService';

export const WalletConnectScreen: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingHedera, setIsConnectingHedera] = useState(false);
  const [hederaPrivateKey, setHederaPrivateKey] = useState('');
  const [showHederaForm, setShowHederaForm] = useState(false);
  const { handleWalletConnect, connectHederaWallet } = useGame();

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = '0x1234...5678';
      handleWalletConnect(mockAddress);
      setIsConnecting(false);
    }, 2000);
  };

  const handleConnectHedera = async () => {
    if (!hederaPrivateKey.trim()) {
      Alert.alert('Error', 'Please enter your Hedera private key');
      return;
    }

    setIsConnectingHedera(true);
    
    try {
      const success = await connectHederaWallet(hederaPrivateKey.trim());
      
      if (success) {
        const address = await starQuestService.getWalletAddress();
        if (address) {
          Alert.alert(
            'Success!',
            `Connected to Hedera wallet: ${address.slice(0, 10)}...${address.slice(-8)}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', 'Failed to connect to Hedera wallet. Please check your private key.');
      }
    } catch (error) {
      console.error('Hedera connection error:', error);
      Alert.alert('Error', 'Failed to connect to Hedera wallet. Please try again.');
    } finally {
      setIsConnectingHedera(false);
    }
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

  const handleDemoHedera = () => {
    Alert.alert(
      'Demo Mode',
      'This will connect to Hedera testnet with demo data. You can interact with the StarQuest contracts but no real HBAR will be used.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Connect Demo', 
          onPress: () => {
            // Use a demo private key for testing
            setHederaPrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
            setShowHederaForm(true);
          }
        },
      ]
    );
  };

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.subtitle}>
            Link your Web3 wallet to start collecting NFTs and join the leaderboard
          </Text>
        </View>

        <View style={styles.content}>
          {/* Hedera Wallet Section */}
          <NeoCard style={styles.hederaCard}>
            <Text style={styles.hederaTitle}>🌟 StarQuest on Hedera</Text>
            <Text style={styles.hederaDescription}>
              Connect to Hedera testnet to interact with StarQuest smart contracts
            </Text>
            
            {!showHederaForm ? (
              <View style={styles.hederaButtons}>
                <NeoButton
                  title="Connect Hedera Wallet"
                  onPress={() => setShowHederaForm(true)}
                  variant="electric"
                  size="md"
                  style={styles.hederaButton}
                />
                <NeoButton
                  title="Demo Mode"
                  onPress={handleDemoHedera}
                  variant="outline"
                  size="md"
                  style={styles.hederaButton}
                />
              </View>
            ) : (
              <View style={styles.hederaForm}>
                <Text style={styles.formLabel}>Hedera Private Key:</Text>
                <TextInput
                  style={styles.privateKeyInput}
                  value={hederaPrivateKey}
                  onChangeText={setHederaPrivateKey}
                  placeholder="0x..."
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={true}
                  multiline={true}
                />
                <View style={styles.formButtons}>
                  <NeoButton
                    title="Connect"
                    onPress={handleConnectHedera}
                    variant="electric"
                    size="md"
                    loading={isConnectingHedera}
                    style={styles.formButton}
                  />
                  <NeoButton
                    title="Cancel"
                    onPress={() => setShowHederaForm(false)}
                    variant="outline"
                    size="md"
                    style={styles.formButton}
                  />
                </View>
              </View>
            )}
          </NeoCard>

          {/* Traditional Wallet Section */}
          <NeoCard style={styles.traditionalCard}>
            <Text style={styles.traditionalTitle}>Traditional Wallets</Text>
            <Text style={styles.traditionalDescription}>
              Connect with standard Web3 wallets
            </Text>
            
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
          </NeoCard>

          {/* Network Info */}
          <NeoCard style={styles.networkCard}>
            <Text style={styles.networkTitle}>Network Information</Text>
            <View style={styles.networkInfo}>
              <Text style={styles.networkItem}>• Network: Hedera Testnet</Text>
              <Text style={styles.networkItem}>• Chain ID: 296</Text>
              <Text style={styles.networkItem}>• RPC: testnet.hashio.io</Text>
              <Text style={styles.networkItem}>• Explorer: hashscan.io/testnet</Text>
            </View>
          </NeoCard>
        </View>
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
  // Hedera Wallet Styles
  hederaCard: {
    backgroundColor: colors.electricPurple + '20',
    borderColor: colors.electricPurple,
    borderWidth: 2,
  },
  hederaTitle: {
    ...typography.brutalMedium,
    color: colors.electricPurple,
    textAlign: 'center',
    marginBottom: 8,
  },
  hederaDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  hederaButtons: {
    gap: 12,
  },
  hederaButton: {
    marginBottom: 8,
  },
  hederaForm: {
    gap: 16,
  },
  formLabel: {
    ...typography.brutalSmall,
    color: colors.foreground,
  },
  privateKeyInput: {
    ...typography.body,
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: colors.foreground,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
  // Traditional Wallet Styles
  traditionalCard: {
    backgroundColor: colors.muted,
  },
  traditionalTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  traditionalDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 20,
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
  // Network Info Styles
  networkCard: {
    backgroundColor: colors.muted,
  },
  networkTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  networkInfo: {
    gap: 8,
  },
  networkItem: {
    ...typography.body,
    color: colors.mutedForeground,
  },
});
