import '@walletconnect/react-native-compat';
import { mainnet, polygon, arbitrum } from '@wagmi/core/chains';
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from '@reown/appkit-wagmi-react-native';
import { QueryClient } from '@tanstack/react-query';

// Setup queryClient
export const queryClient = new QueryClient();

// Get projectId - you'll need to get this from https://dashboard.reown.com
// For demo purposes, using a placeholder. Get your own at: https://dashboard.reown.com
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '14ea17265d2b49b6a49b699b1669d6ca';

// App metadata
export const metadata = {
  name: 'StarQuest AR',
  description: 'Connect your wallet to start your cosmic adventure',
  url: 'https://starquest-ar.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'starquestar://',
    universal: 'https://starquest-ar.app',
  },
};

// Supported chains
export const chains = [mainnet, polygon, arbitrum] as const;

// Create wagmi config
export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata 
});

// Create and configure AppKit
let appKitConfigured = false;

export const initializeAppKit = () => {
  if (!appKitConfigured) {
    try {
      createAppKit({
        projectId,
        metadata,
        wagmiConfig,
        defaultChain: mainnet,
        enableAnalytics: true,
      });
      appKitConfigured = true;
      console.log('AppKit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AppKit:', error);
    }
  }
};

// Export for components
export { AppKit };
