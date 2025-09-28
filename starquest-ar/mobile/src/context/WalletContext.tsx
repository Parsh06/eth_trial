import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService, WalletState, initialWalletState } from '../services/WalletService';

// Context interface
interface WalletContextType {
  walletState: WalletState;
  isLoading: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  formatAddress: (address: string) => string;
  getNetworkName: (chainId: string) => string;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and check existing connection
  useEffect(() => {
    initializeWallet();

    // Add listener for wallet state changes
    const handleStateChange = (newState: WalletState) => {
      setWalletState(newState);
    };

    walletService.addListener(handleStateChange);

    return () => {
      walletService.removeListener(handleStateChange);
    };
  }, []);

  // Initialize wallet on app start
  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Initializing wallet...');
      
      const currentState = await walletService.getWalletState();
      setWalletState(currentState);

      if (currentState.isConnected) {
        console.log('✅ Wallet connection restored:', currentState.address);
      } else {
        console.log('ℹ️ No existing wallet connection found');
      }
    } catch (error) {
      console.error('❌ Error initializing wallet:', error);
      setWalletState({
        ...initialWalletState,
        error: 'Failed to initialize wallet',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to wallet using simplified approach
  const connect = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔗 Initiating wallet connection...');
      
      const newState = await walletService.connect();
      
      if (newState.isConnected) {
        console.log('✅ Wallet connected successfully');
        return true;
      } else {
        console.log('❌ Wallet connection failed:', newState.error);
        return false;
      }
      
    } catch (error: any) {
      console.error('❌ Wallet connection error:', error);
      setWalletState({ 
        ...initialWalletState, 
        error: error.message || 'Failed to connect wallet' 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from wallet
  const disconnect = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await walletService.disconnect();
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balance
  const refreshBalance = async (): Promise<void> => {
    if (!walletState.isConnected) return;
    
    try {
      await walletService.updateBalance();
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
    }
  };

  // Helper functions
  const formatAddress = (address: string): string => {
    return walletService.formatAddress(address);
  };

  const getNetworkName = (chainId: string): string => {
    return walletService.getNetworkName(chainId);
  };

  // Context value
  const contextValue: WalletContextType = {
    walletState,
    isLoading,
    connect,
    disconnect,
    refreshBalance,
    formatAddress,
    getNetworkName,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
