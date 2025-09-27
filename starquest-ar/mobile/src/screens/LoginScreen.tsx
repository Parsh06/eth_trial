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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { useAccount, useSignMessage } from 'wagmi';
import { useGame } from '../context/GameContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { metaMaskService, WalletInfo } from '../services/MetaMaskService';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { handleWalletConnect, loading, error } = useGame();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
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
      setConnectionStatus('Opening wallet connection...');
      
      // Use AppKit to open the modal
      open();
      
    } catch (error: any) {
      console.error('AppKit connection error:', error);
      setConnectionStatus('');
      Alert.alert('Connection Failed', 'Failed to open wallet connection. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle successful wallet connection
  useEffect(() => {
    if (isConnected && address) {
      const authenticateWallet = async () => {
        try {
          setIsConnecting(true);
          setConnectionStatus('Requesting signature for authentication...');
          
          // Sign a message for authentication
          const message = `Welcome to StarQuest AR!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
          const signature = await signMessageAsync({ 
            account: address as `0x${string}`,
            message 
          });
          
          // Connect to the app with signature and message
          setConnectionStatus('Authenticating with StarQuest...');
          await handleWalletConnect(address, signature, message);
          
          setConnectionStatus('Welcome to StarQuest AR! 🌟');
          console.log('Wallet connected successfully with signature verification');
          
        } catch (error: any) {
          console.error('Authentication error:', error);
          setConnectionStatus('');
          
          // Handle specific error types
          let errorMessage = 'Failed to authenticate wallet. Please try again.';
          let errorTitle = 'Authentication Failed';
          
          if (error.message.includes('User rejected')) {
            errorMessage = 'Signature was cancelled. Please try again to complete authentication.';
            errorTitle = 'Signature Cancelled';
          }
          
          Alert.alert(errorTitle, errorMessage, [{ text: 'OK', style: 'default' }]);
        } finally {
          setIsConnecting(false);
        }
      };

      authenticateWallet();
    }
  }, [isConnected, address, signMessageAsync, handleWalletConnect]);

  const connectWalletConnect = async () => {
    try {
      setIsConnecting(true);
      
      // For now, use MetaMask as fallback for WalletConnect
      // In a real implementation, you would use WalletConnect SDK
      Alert.alert(
        'WalletConnect',
        'WalletConnect integration is coming soon! For now, please use MetaMask.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use MetaMask', style: 'default', onPress: connectMetaMask }
        ]
      );
      
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
              title={isConnecting || loading ? 
                (connectionStatus ? 'Connecting...' : 'Connecting...') : 
                'Connect MetaMask'
              }
              onPress={connectMetaMask}
              variant="gradient"
              gradient={[colors.electricPurple, colors.electricPink]}
              size="large"
              disabled={isConnecting || loading}
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
              disabled={isConnecting || loading}
              style={styles.connectButton}
            />
          </NeoCard>

          {/* Demo Mode Card - for development */}
          {__DEV__ && (
            <NeoCard style={{...styles.walletCard, ...styles.demoCard}}>
              <View style={styles.walletHeader}>
                <Text style={styles.walletIcon}>⚡</Text>
                <Text style={styles.walletTitle}>Demo Mode</Text>
              </View>
              <Text style={styles.walletDescription}>
                Quick demo connection for testing (Development only)
              </Text>
              <NeoButton
                title={isConnecting ? 'Connecting...' : 'Demo Connect'}
                onPress={async () => {
                  try {
                    setIsConnecting(true);
                    setConnectionStatus('Demo connection...');
                    
                    // Simulate connection delay
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    const demoAddress = '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4';
                    setConnectionStatus('Demo authenticated!');
                    
                    await handleWalletConnect(demoAddress);
                  } catch (error) {
                    console.error('Demo connection error:', error);
                    Alert.alert('Demo Error', 'Demo connection failed');
                  } finally {
                    setIsConnecting(false);
                  }
                }}
                variant="default"
                size="large"
                disabled={isConnecting || loading}
                style={styles.connectButton}
              />
            </NeoCard>
          )}
        </View>

        {/* Debug Options - only in development */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={async () => {
                try {
                  await AsyncStorage.clear();
                  Alert.alert('Cache Cleared', 'All cached data has been removed. Restart the app to test fresh login.');
                } catch (error) {
                  Alert.alert('Error', 'Failed to clear cache');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Clear Cache (Debug)</Text>
            </TouchableOpacity>
          </View>
        )}

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
        {(loading || isConnecting) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.electricPurple} />
            <Text style={styles.loadingText}>
              {connectionStatus || 'Setting up your cosmic profile...'}
            </Text>
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
    paddingTop: 60,
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
  demoCard: {
    borderColor: colors.electricGreen,
    backgroundColor: colors.electricGreen + '05',
  },
  debugContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
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
