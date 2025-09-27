import '../polyfills';
import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, queryClient } from "../config/wagmi";
import { LazyWalletConnect } from "./LazyWalletConnect";

interface WalletProviderProps {
  children: React.ReactNode;
  walletEnabled?: boolean;
}

const WalletProvider: React.FC<WalletProviderProps> = ({ children, walletEnabled = false }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <LazyWalletConnect enabled={walletEnabled} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletProvider;
