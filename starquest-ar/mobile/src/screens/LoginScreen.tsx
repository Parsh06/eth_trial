import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { handleWalletConnect, loading, error } = useGame();
  const [isConnecting, setIsConnecting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      
      // Use dummy data for demo
      const dummyAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      await handleWalletConnect(dummyAddress);
    } catch (error) {
      console.error('MetaMask connection error:', error);
      Alert.alert(
        'Connection Failed',
        'Please try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    try {
      setIsConnecting(true);
      // Use dummy data for demo
      const dummyAddress = '0x8ba1f109551bD432803012645Hac136c';
      await handleWalletConnect(dummyAddress);
    } catch (error) {
      console.error('WalletConnect error:', error);
      Alert.alert('Connection Failed', 'Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to StarQuest AR</Text>
          <Text style={styles.subtitle}>
            Connect your wallet to start your cosmic adventure
          </Text>
        </View>

        {/* Wallet Options */}
        <View style={styles.walletOptions}>
          <NeoCard style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletIcon}>🦊</Text>
              <Text style={styles.walletTitle}>MetaMask</Text>
            </View>
            <Text style={styles.walletDescription}>
              Connect using your MetaMask wallet to access all features
            </Text>
            <NeoButton
              title={isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              onPress={connectMetaMask}
              variant="gradient"
              gradient={[colors.electricPurple, colors.electricPink]}
              size="large"
              disabled={isConnecting}
              style={styles.connectButton}
            />
          </NeoCard>

          <NeoCard style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletIcon}>🔗</Text>
              <Text style={styles.walletTitle}>WalletConnect</Text>
            </View>
            <Text style={styles.walletDescription}>
              Connect using WalletConnect for mobile wallet support
            </Text>
            <NeoButton
              title={isConnecting ? 'Connecting...' : 'Connect Wallet'}
              onPress={connectWalletConnect}
              variant="outline"
              size="large"
              disabled={isConnecting}
              style={styles.connectButton}
            />
          </NeoCard>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you'll get:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>Collect rare AR stars</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎁</Text>
              <Text style={styles.featureText}>Earn exclusive NFTs</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Compete on leaderboards</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚔️</Text>
              <Text style={styles.featureText}>Complete epic quests</Text>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.electricPurple} />
            <Text style={styles.loadingText}>Setting up your cosmic profile...</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <NeoCard style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </NeoCard>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.brutalLarge,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.subheading,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  walletOptions: {
    marginBottom: 40,
  },
  walletCard: {
    marginBottom: 20,
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.foreground,
    shadowColor: colors.foreground,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  walletTitle: {
    ...typography.heading3,
    color: colors.foreground,
  },
  walletDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 20,
    lineHeight: 22,
  },
  connectButton: {
    width: '100%',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    ...typography.heading3,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: (width - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.foreground,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 12,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
    borderWidth: 1,
    padding: 16,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});
