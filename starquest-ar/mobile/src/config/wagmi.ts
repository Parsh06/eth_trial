import { mainnet, polygon, arbitrum } from "@wagmi/core/chains";
import { QueryClient } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
} from "@reown/appkit-wagmi-react-native";

// 0. Setup queryClient with optimized config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 1. Get projectId at https://dashboard.reown.com
// For demo purposes, using a placeholder - replace with your actual project ID
const projectId = "14ea17265d2b49b6a49b699b1669d6ca"; // TODO: Replace with actual project ID from https://dashboard.reown.com

// 2. Create config
const metadata = {
  name: "StarQuest AR",
  description: "Collect rare AR stars and earn exclusive NFTs in the cosmic adventure",
  url: "https://starquest-ar.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "starquestar://",
    universal: "https://starquest-ar.com",
  },
};

const chains = [mainnet, polygon, arbitrum] as const;

export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata 
});

// 3. Create modal - delay initialization to improve startup time
let appKitInitialized = false;

export const initializeAppKit = () => {
  if (!appKitInitialized) {
    try {
      createAppKit({
        projectId,
        metadata,
        wagmiConfig,
        defaultChain: mainnet,
        enableAnalytics: false,
        // Fix WalletConnect subscription errors
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: false,
        enableCoinbase: false,
        themeMode: 'light',
        // Reduce subscription conflicts
        featuredWalletIds: [],
        includeWalletIds: [],
        excludeWalletIds: [],
        // Disable problematic features
        enableSwaps: false,
        enableOnramp: false,
      });
      appKitInitialized = true;
    } catch (error) {
      console.warn('AppKit initialization error:', error);
    }
  }
};

// Don't auto-initialize - let LazyWalletConnect handle it when needed
// setTimeout(() => {
//   initializeAppKit();
// }, 1000); 