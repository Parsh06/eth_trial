import "@walletconnect/react-native-compat";
import { mainnet, polygon, arbitrum } from "@wagmi/core/chains";
import { QueryClient } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
} from "@reown/appkit-wagmi-react-native";

// 0. Setup queryClient
export const queryClient = new QueryClient();

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

// 3. Create modal
createAppKit({
  projectId,
  metadata,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
}); 