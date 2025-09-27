import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Simple wallet service for React Native
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

  // Connect to wallet (simulated for now)
  async connect(): Promise<WalletState> {
    try {
      console.log('🔗 Connecting to wallet...');

      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock wallet data
      const mockAddress = '0x742d35Cc6235aC8C1A7A5E6A2B3Cc0FA7E56DE7A';
      const mockChainId = '0x1'; // Ethereum mainnet
      const mockBalance = '1.2345';

      const connectedState: WalletState = {
        isConnected: true,
        address: mockAddress,
        chainId: mockChainId,
        balance: mockBalance,
        error: null,
      };

      // Save connection to storage
      await AsyncStorage.setItem('wallet_connected', 'true');
      await AsyncStorage.setItem('wallet_address', mockAddress);
      await AsyncStorage.setItem('wallet_chainId', mockChainId);
      await AsyncStorage.setItem('wallet_balance', mockBalance);

      console.log('✅ Wallet connected:', mockAddress);
      this.notifyListeners(connectedState);
      
      return connectedState;

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

  // Disconnect from wallet
  async disconnect(): Promise<void> {
    try {
      console.log('🔌 Disconnecting wallet...');

      // Clear storage
      await AsyncStorage.multiRemove([
        'wallet_connected',
        'wallet_address', 
        'wallet_chainId',
        'wallet_balance'
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

  // Update balance
  async updateBalance(): Promise<string> {
    try {
      // Simulate fetching balance
      const newBalance = (Math.random() * 5).toFixed(4);
      await AsyncStorage.setItem('wallet_balance', newBalance);
      
      // Notify listeners of updated state
      const currentState = await this.getWalletState();
      this.notifyListeners(currentState);
      
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
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();
