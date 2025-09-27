import { Linking } from 'react-native';

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  packageName: string;
  deepLinkUrl: string;
  isInstalled: boolean;
  priority: number; // Higher number = higher priority
}

export interface WalletConnectionOption extends WalletInfo {
  connectFunction: () => Promise<void>;
}

export class WalletDetectionService {
  private static wallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      packageName: 'io.metamask',
      deepLinkUrl: 'metamask://',
      isInstalled: false,
      priority: 10
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      packageName: 'com.wallet.crypto.trustapp',
      deepLinkUrl: 'trust://',
      isInstalled: false,
      priority: 9
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      packageName: 'me.rainbow',
      deepLinkUrl: 'rainbow://',
      isInstalled: false,
      priority: 8
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '💙',
      packageName: 'com.coinbase.android',
      deepLinkUrl: 'cbwallet://',
      isInstalled: false,
      priority: 7
    },
    {
      id: 'zerion',
      name: 'Zerion',
      icon: '⚡',
      packageName: 'io.zerion.android',
      deepLinkUrl: 'zerion://',
      isInstalled: false,
      priority: 6
    },
    {
      id: 'uniswap',
      name: 'Uniswap Wallet',
      icon: '🦄',
      packageName: 'com.uniswap.mobile',
      deepLinkUrl: 'uniswap://',
      isInstalled: false,
      priority: 5
    },
    {
      id: 'argent',
      name: 'Argent',
      icon: '🔐',
      packageName: 'io.argent.wallet',
      deepLinkUrl: 'argent://',
      isInstalled: false,
      priority: 4
    },
    {
      id: 'alphawallet',
      name: 'AlphaWallet',
      icon: '⍺',
      packageName: 'com.alphawallet',
      deepLinkUrl: 'alphawallet://',
      isInstalled: false,
      priority: 3
    }
  ];

  static async detectInstalledWallets(): Promise<WalletInfo[]> {
    const updatedWallets: WalletInfo[] = [];

    for (const wallet of this.wallets) {
      try {
        const isInstalled = await Linking.canOpenURL(wallet.deepLinkUrl);
        updatedWallets.push({
          ...wallet,
          isInstalled
        });
      } catch (error) {
        console.warn(`Failed to detect ${wallet.name}:`, error);
        updatedWallets.push({
          ...wallet,
          isInstalled: false
        });
      }
    }

    // Sort by installation status (installed first) then by priority
    return updatedWallets.sort((a, b) => {
      if (a.isInstalled !== b.isInstalled) {
        return a.isInstalled ? -1 : 1; // Installed wallets first
      }
      return b.priority - a.priority; // Higher priority first
    });
  }

  static async getWalletConnectionOptions(
    onConnect: (walletId: string, address: string) => Promise<void>
  ): Promise<WalletConnectionOption[]> {
    const detectedWallets = await this.detectInstalledWallets();
    
    return detectedWallets.map(wallet => ({
      ...wallet,
      connectFunction: async () => {
        try {
          if (wallet.isInstalled) {
            // Try to open the wallet app
            await Linking.openURL(wallet.deepLinkUrl);
            
            // Simulate connection process
            // In a real implementation, this would handle the actual connection logic
            setTimeout(async () => {
              const mockAddress = this.generateMockAddress();
              await onConnect(wallet.id, mockAddress);
            }, 3000);
          } else {
            // Show install prompt
            throw new Error(`${wallet.name} is not installed`);
          }
        } catch (error) {
          console.error(`Failed to connect to ${wallet.name}:`, error);
          throw error;
        }
      }
    }));
  }

  private static generateMockAddress(): string {
    // Generate a mock Ethereum address for demonstration
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  static async openWalletStore(packageName: string): Promise<void> {
    try {
      // Try Play Store first
      const playStoreUrl = `market://details?id=${packageName}`;
      const canOpenPlayStore = await Linking.canOpenURL(playStoreUrl);
      
      if (canOpenPlayStore) {
        await Linking.openURL(playStoreUrl);
      } else {
        // Fallback to web Play Store
        const webPlayStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
        await Linking.openURL(webPlayStoreUrl);
      }
    } catch (error) {
      console.error('Failed to open app store:', error);
      throw error;
    }
  }

  static getWalletByPackageName(packageName: string): WalletInfo | undefined {
    return this.wallets.find(wallet => wallet.packageName === packageName);
  }

  static getWalletById(id: string): WalletInfo | undefined {
    return this.wallets.find(wallet => wallet.id === id);
  }
}
