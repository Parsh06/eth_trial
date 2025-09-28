import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';
import { walletConnectService, WalletConnectState } from './WalletConnectService';

// Wallet connection state interface
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  balance: string | null;
  error: string | null;
}

// Initial wallet state
export const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  error: null,
};

// React Native MetaMask integration using deep links
export class WalletService {
  private static instance: WalletService;
  private listeners: ((state: WalletState) => void)[] = [];

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Generate a mock wallet address for demo purposes
  private generateMockAddress(): string {
    const addresses = [
      '0x742d35Cc6235aC8C1A7A5E6A2B3Cc0FA7E56DE7A',
      '0x8ba1f109551bD432803012645Hac136c30C60b59',
      '0xd85f4d84f0F22f06f90485b4dC9E5a62EC8C4F38',
      '0x123d67f2AEF912cc2a458A8d0a5e83B4B5C5E9fA',
      '0x9876eD24b2c4F08A1234567890aBcDeF12345678'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  // Open MetaMask mobile app with proper wallet connection request
  private async openMetaMaskApp(): Promise<boolean> {
    try {
      // Method 1: Try WalletConnect-style deep link (most compatible)
      const wcUri = this.generateWalletConnectUri();
      const wcDeepLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(wcUri)}`;
      
      console.log('🔗 Trying WalletConnect-style deep link...');
      
      const canOpenWC = await Linking.canOpenURL(wcDeepLink);
      if (canOpenWC) {
        await Linking.openURL(wcDeepLink);
        return true;
      }
      
      // Method 2: Try direct MetaMask deep link with connection intent
      const directLink = `metamask://wc?uri=${encodeURIComponent(wcUri)}`;
      console.log('🔗 Trying direct MetaMask deep link...');
      
      const canOpenDirect = await Linking.canOpenURL(directLink);
      if (canOpenDirect) {
        await Linking.openURL(directLink);
        return true;
      }
      
      // Method 3: Fallback to basic MetaMask open
      const basicLink = 'metamask://app';
      console.log('🔗 Trying basic MetaMask link...');
      
      const canOpenBasic = await Linking.canOpenURL(basicLink);
      if (canOpenBasic) {
        await Linking.openURL(basicLink);
        return true;
      }
      
      // MetaMask not installed
      Alert.alert(
        'MetaMask Required',
        'MetaMask app is required to connect your wallet. Please install it from the app store.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Install MetaMask',
            onPress: () => {
              const playStoreUrl = 'https://play.google.com/store/apps/details?id=io.metamask';
              Linking.openURL(playStoreUrl);
            }
          }
        ]
      );
      return false;
      
    } catch (error) {
      console.error('Error opening MetaMask app:', error);
      return false;
    }
  }
  
  // Generate a mock WalletConnect URI for demo purposes
  private generateWalletConnectUri(): string {
    const topic = this.generateRandomTopic();
    const symKey = this.generateRandomKey();
    const relay = 'wss://relay.walletconnect.com';
    
    // This is a simplified WalletConnect v2 URI format
    return `wc:${topic}@2?relay-protocol=irn&symKey=${symKey}`;
  }
  
  private generateRandomTopic(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }
  
  private generateRandomKey(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  // Add state change listener
  addListener(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
  }

  // Remove state change listener
  removeListener(listener: (state: WalletState) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of state changes
  private notifyListeners(state: WalletState) {
    this.listeners.forEach(listener => listener(state));
  }

  // Connect to wallet with real WalletConnect integration
  async connect(): Promise<WalletState> {
    try {
      console.log('🔗 Starting real MetaMask connection...');

      // Show connection method dialog
      const connectionMethod = await new Promise<'walletconnect' | 'demo' | 'cancel'>((resolve) => {
        Alert.alert(
          'Connect Wallet 🚀',
          'Choose your connection method:\n\n🔗 WalletConnect: Real MetaMask integration with proper blockchain connection\n\n✨ Demo Mode: Mock wallet for testing (fallback)',
          [
            { text: 'Cancel', onPress: () => resolve('cancel'), style: 'cancel' },
            { text: '✨ Demo Mode', onPress: () => resolve('demo') },
            { text: '🔗 WalletConnect', onPress: () => resolve('walletconnect'), style: 'default' }
          ]
        );
      });

      if (connectionMethod === 'cancel') {
        const cancelledState: WalletState = {
          ...initialWalletState,
          error: 'User cancelled connection',
        };
        this.notifyListeners(cancelledState);
        return cancelledState;
      }

      if (connectionMethod === 'demo') {
        return await this.connectDemoMode();
      }

      if (connectionMethod === 'walletconnect') {
        return await this.connectWalletConnect();
      }

      return initialWalletState;

    } catch (error: any) {
      console.error('❌ Wallet connection error:', error);
      
      const errorState: WalletState = {
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        error: error.message || 'Failed to connect wallet',
      };

      this.notifyListeners(errorState);
      return errorState;
    }
  }
  
  // Demo mode connection (instant, perfect for development)
  private async connectDemoMode(): Promise<WalletState> {
    console.log('🎭 Demo mode connection started...');
    
    // Generate realistic demo wallet data
    const mockAddress = this.generateMockAddress();
    const mockChainId = '0x1'; // Ethereum mainnet
    const mockBalance = (Math.random() * 2 + 0.1).toFixed(4);

    const connectedState: WalletState = {
      isConnected: true,
      address: mockAddress,
      chainId: mockChainId,
      balance: mockBalance,
      error: null,
    };

    await this.saveWalletState(connectedState);
    console.log('✅ Demo wallet connected:', mockAddress, 'balance:', mockBalance, 'ETH');
    
    // Show success message
    Alert.alert(
      'Wallet Connected! 🎉',
      `Demo wallet connected successfully!

Address: ${this.formatAddress(mockAddress)}
Balance: ${mockBalance} ETH
Network: Ethereum Mainnet`,
      [{ text: 'Continue', style: 'default' }]
    );
    
    this.notifyListeners(connectedState);
    return connectedState;
  }
  
  // Real MetaMask connection attempt
  private async connectMetaMask(): Promise<WalletState> {
    try {
      console.log('🦊 Attempting MetaMask connection...');
      
      const metaMaskOpened = await this.openMetaMaskApp();
      
      if (!metaMaskOpened) {
        const errorState: WalletState = {
          ...initialWalletState,
          error: 'MetaMask app not available',
        };
        this.notifyListeners(errorState);
        return errorState;
      }

      // Show helpful message about MetaMask connection
      const waitResult = await new Promise<'connected' | 'failed' | 'cancel'>((resolve) => {
        Alert.alert(
          'MetaMask Connection',
          'MetaMask should have opened. Since real wallet integration requires complex setup, we recommend using Demo Mode for now.\n\nWhat would you like to do?',
          [
            { text: 'Cancel', onPress: () => resolve('cancel'), style: 'cancel' },
            { text: 'Try Demo Mode', onPress: () => resolve('connected') },
            { text: 'Connection Failed', onPress: () => resolve('failed') }
          ]
        );
      });
      
      if (waitResult === 'cancel') {
        return { ...initialWalletState, error: 'Connection cancelled' };
      }
      
      if (waitResult === 'failed') {
        return { ...initialWalletState, error: 'MetaMask connection failed. Please try Demo Mode.' };
      }
      
      // User chose to continue with demo mode
      return await this.connectDemoMode();
      
    } catch (error: any) {
      console.error('❌ MetaMask connection failed:', error);
      return {
        ...initialWalletState,
        error: 'MetaMask connection failed. Please try demo mode.'
      };
    }
  }
  
  // Real WalletConnect integration
  private async connectWalletConnect(): Promise<WalletState> {
    try {
      console.log('🔗 Starting WalletConnect integration...');
      
      // Check if running in Expo Go (which has limitations)
      const isExpoGo = __DEV__ && !process.env.EAS_BUILD_PROFILE;
      
      if (isExpoGo) {
        const proceedAnyway = await new Promise<boolean>((resolve) => {
          Alert.alert(
            '⚠️ Expo Go Limitation',
            'WalletConnect may not work properly in Expo Go due to deep linking limitations. For best results:\n\n1. Use EAS Build for production\n2. Try Demo Mode for testing\n\nTry WalletConnect anyway?',
            [
              { text: 'Use Demo Mode', onPress: () => resolve(false) },
              { text: 'Try Anyway', onPress: () => resolve(true) }
            ]
          );
        });
        
        if (!proceedAnyway) {
          return await this.connectDemoMode();
        }
      }
      
      // Initialize and connect via WalletConnect
      const wcState = await walletConnectService.connect();
      
      // Convert WalletConnect state to our WalletState format
      const walletState: WalletState = {
        isConnected: wcState.isConnected,
        address: wcState.address,
        chainId: wcState.chainId,
        balance: null, // We'll fetch this separately
        error: wcState.error,
      };
      
      if (wcState.isConnected && wcState.address) {
        // Fetch real balance from blockchain (simplified)
        try {
          // For now, set a realistic demo balance
          // In production, you'd call a blockchain RPC endpoint
          const balance = (Math.random() * 2 + 0.1).toFixed(4);
          walletState.balance = balance;
          
          // Save wallet state
          await this.saveWalletState(walletState);
        } catch (balanceError) {
          console.warn('⚠️ Could not fetch balance:', balanceError);
          walletState.balance = '0.0000';
        }
      }
      
      this.notifyListeners(walletState);
      return walletState;
      
    } catch (error: any) {
      console.error('❌ WalletConnect integration failed:', error);
      
      // Fallback to demo mode
      Alert.alert(
        'Connection Failed',
        'WalletConnect failed to connect. Would you like to try Demo Mode instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use Demo Mode', onPress: async () => {
            const demoState = await this.connectDemoMode();
            this.notifyListeners(demoState);
          }}
        ]
      );
      
      return {
        ...initialWalletState,
        error: 'WalletConnect failed. Try Demo Mode.'
      };
    }
  }

  // Disconnect from wallet
  async disconnect(): Promise<void> {
    try {
      console.log('🔌 Disconnecting wallet...');

      // Disconnect WalletConnect session if active
      try {
        await walletConnectService.disconnect();
      } catch (wcError) {
        console.warn('⚠️ WalletConnect disconnect warning:', wcError);
      }

      // Clear storage
      await AsyncStorage.multiRemove([
        'wallet_connected',
        'wallet_address', 
        'wallet_chainId',
        'wallet_balance',
        'wc_session'
      ]);

      const disconnectedState: WalletState = {
        ...initialWalletState
      };

      console.log('✅ Wallet disconnected');
      this.notifyListeners(disconnectedState);

    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }

  // Check if wallet is connected
  async isConnected(): Promise<boolean> {
    try {
      const connected = await AsyncStorage.getItem('wallet_connected');
      return connected === 'true';
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      return false;
    }
  }

  // Get current wallet state
  async getWalletState(): Promise<WalletState> {
    try {
      const isConnected = await this.isConnected();
      
      if (!isConnected) {
        return initialWalletState;
      }

      const [address, chainId, balance] = await AsyncStorage.multiGet([
        'wallet_address',
        'wallet_chainId', 
        'wallet_balance'
      ]);

      return {
        isConnected: true,
        address: address[1],
        chainId: chainId[1],
        balance: balance[1],
        error: null,
      };

    } catch (error) {
      console.error('❌ Error getting wallet state:', error);
      return {
        ...initialWalletState,
        error: 'Failed to get wallet state',
      };
    }
  }

  // Save wallet state to AsyncStorage
  private async saveWalletState(state: WalletState) {
    try {
      await AsyncStorage.setItem('wallet_connected', state.isConnected.toString());
      if (state.address) await AsyncStorage.setItem('wallet_address', state.address);
      if (state.chainId) await AsyncStorage.setItem('wallet_chainId', state.chainId);
      if (state.balance) await AsyncStorage.setItem('wallet_balance', state.balance);
    } catch (error) {
      console.error('❌ Error saving wallet state:', error);
    }
  }

  // Update balance (simplified for React Native demo)
  async updateBalance(): Promise<string> {
    try {
      const currentState = await this.getWalletState();
      if (!currentState.isConnected) {
        console.warn('⚠️ Wallet not connected for balance update');
        return '0';
      }

      // Generate new random balance for demo (in real app, this would query blockchain)
      const newBalance = (Math.random() * 2 + 0.1).toFixed(4);
      
      await AsyncStorage.setItem('wallet_balance', newBalance);
      
      // Notify listeners of updated state
      const updatedState = await this.getWalletState();
      this.notifyListeners(updatedState);
      
      return newBalance;
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      return '0';
    }
  }

  // Get network name from chain ID
  getNetworkName(chainId: string): string {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x89':
        return 'Polygon';
      case '0xa4b1':
        return 'Arbitrum';
      default:
        return `Chain ${chainId}`;
    }
  }

  // Format address for display
  formatAddress(address: string | null): string {
    if (!address) {
      return 'Not connected';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();
