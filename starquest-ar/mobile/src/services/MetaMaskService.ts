import { Platform, Alert } from 'react-native';
import { ENV } from '../config/environment';

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: string;
  isConnected: boolean;
}

export class MetaMaskService {
  private apiKey: string;

  constructor() {
    this.apiKey = ENV.METAMASK_API_KEY;
  }

  async connectWallet(): Promise<WalletInfo> {
    try {
      // Check if we're in a web environment
      if (Platform.OS === 'web') {
        return await this.connectWebWallet();
      } else {
        // For mobile, simulate wallet connection with dummy data
        return await this.connectMobileWallet();
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  private async connectWebWallet(): Promise<WalletInfo> {
    // Check if MetaMask is available
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask browser extension.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert balance from wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      
      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      return {
        address,
        balance: balanceInEth,
        chainId,
        isConnected: true,
      };
    } catch (error) {
      console.error('Web wallet connection failed:', error);
      throw new Error(`Failed to connect web wallet: ${error.message}`);
    }
  }

  private async connectMobileWallet(): Promise<WalletInfo> {
    // For mobile, simulate wallet connection
    // In a real implementation, you would use WalletConnect or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
        resolve({
          address: mockAddress,
          balance: (Math.random() * 10).toFixed(4),
          chainId: '0x1',
          isConnected: true,
        });
      }, 1000);
    });
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (Platform.OS === 'web' && window.ethereum) {
        // For web, we can't actually disconnect, just clear local state
        console.log('Wallet disconnected');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      if (Platform.OS === 'web' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, accounts[0]],
        });
        
        return signature;
      } else {
        // For mobile, simulate signature
        return '0x' + Math.random().toString(16).substr(2, 130);
      }
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  async getAccountInfo(): Promise<WalletInfo | null> {
    try {
      if (Platform.OS === 'web' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        
        if (!accounts || accounts.length === 0) {
          return null;
        }

        const address = accounts[0];
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        return {
          address,
          balance: balanceInEth,
          chainId,
          isConnected: true,
        };
      } else {
        // For mobile, return null (not connected)
        return null;
      }
    } catch (error) {
      console.error('Failed to get account info:', error);
      return null;
    }
  }

  isWalletInstalled(): boolean {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && !!window.ethereum;
    } else {
      // For mobile, always return true (we'll simulate)
      return true;
    }
  }

  async switchNetwork(chainId: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
        });
      } else {
        // For mobile, just log
        console.log(`Switching to network: ${chainId}`);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
}

// Create singleton instance
export const metaMaskService = new MetaMaskService();
