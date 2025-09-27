import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

// Web3 imports - now enabled with AppKit
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAppKit, AppKitButton } from '@reown/appkit-wagmi-react-native';

import { useGame } from '../context/GameContext';

// Get screen dimensions
const { width } = Dimensions.get('window');
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const LoginScreen: React.FC = () => {
  const { handleWalletConnect, loading, error } = useGame();
  const { open } = useAppKit();
  // Enable wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Add refs to track authentication state and user intent
  const hasAuthenticatedRef = useRef(false);
  const currentAddressRef = useRef<string | null>(null);
  const userInitiatedConnectionRef = useRef(false);

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
    
    // Disconnect any existing connections on mount to ensure clean state
    if (isConnected) {
      console.log('Found existing wallet connection, disconnecting for fresh start...');
      disconnect();
    }
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('Opening wallet connection...');
      
      // Mark that user initiated this connection
      userInitiatedConnectionRef.current = true;
      
      // Reset authentication state
      hasAuthenticatedRef.current = false;
      currentAddressRef.current = null;
      
      // Use AppKit to open the modal
      open();
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setConnectionStatus('');
      userInitiatedConnectionRef.current = false;
      Alert.alert('Connection Failed', 'Failed to open wallet connection. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle successful wallet connection
  useEffect(() => {
    const authenticateWallet = async () => {
      // Only authenticate if:
      // 1. User initiated the connection
      // 2. We have a connected wallet with address
      // 3. Haven't already authenticated this address
      if (!userInitiatedConnectionRef.current || 
          !isConnected || 
          !address || 
          hasAuthenticatedRef.current || 
          currentAddressRef.current === address) {
        return;
      }
      
      try {
        console.log('🔗 Starting user-initiated wallet authentication for address:', address);
        hasAuthenticatedRef.current = true;
        currentAddressRef.current = address;
        
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
        console.log('🚀 Calling handleWalletConnect with:', { address, hasSignature: !!signature });
        
        await handleWalletConnect(address, signature, message);
        
        console.log('✅ handleWalletConnect completed successfully');
        setConnectionStatus('Welcome to StarQuest AR! 🌟');
        console.log('Wallet connected successfully with signature verification');
        
        // Clear connection status after a delay to show success message
        setTimeout(() => {
          setConnectionStatus('');
        }, 2000);
    
      } catch (error: any) {
        console.error('Authentication error:', error);
        setConnectionStatus('');
        
        // Reset authentication state on error
        hasAuthenticatedRef.current = false;
        currentAddressRef.current = null;
        userInitiatedConnectionRef.current = false;
        
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

    if (isConnected && address) {
      authenticateWallet();
    }
  }, [isConnected, address, signMessageAsync]);

  // Reset authentication state when address changes or disconnects
  useEffect(() => {
    if (!isConnected || !address) {
      hasAuthenticatedRef.current = false;
      currentAddressRef.current = null;
      userInitiatedConnectionRef.current = false;
      setConnectionStatus('');
    }
  }, [isConnected, address]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

        {/* Connection Status */}
        {connectionStatus ? (
          <NeoCard style={styles.statusCard}>
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </NeoCard>
        ) : null}

        {/* Main Wallet Connection */}
        <View style={styles.walletOptions}>
          <NeoCard style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletIcon}>🔗</Text>
              <Text style={styles.walletTitle}>Connect Wallets</Text>
            </View>
            <Text style={styles.walletDescription}>
              Connect your preferred wallet to access all StarQuest AR features. Supports MetaMask, Rainbow, Trust Wallet, and 100+ others.
            </Text>
            
            {/* Single Connect Button */}
            <NeoButton
              title={isConnecting ? 'Connecting...' : 'Connect Wallet'}
              onPress={connectWallet}
              variant="gradient"
              gradient={[colors.electricPurple, colors.electricPink]}
              size="large"
              disabled={isConnecting || loading}
              style={styles.connectButton}
            />
          </NeoCard>
        </View>

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

        {/* Debug Options - only in development */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={async () => {
                try {
                  await AsyncStorage.clear();
                  // Also disconnect any active wallet connections
                  if (isConnected) {
                    disconnect();
                  }
                  Alert.alert('Cache Cleared', 'All cached data and wallet connections have been cleared. Restart the app to test fresh login.');
                } catch (error) {
                  Alert.alert('Error', 'Failed to clear cache');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Clear Cache & Disconnect (Debug)</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 40,
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
    boxShadow: '6px 6px 0px ' + colors.foreground,
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
  statusCard: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  statusText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
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
