import React, { Suspense, lazy, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { initializeAppKit } from '../config/wagmi';

// Only load AppKit when actually needed
const AppKit = lazy(() => 
  import('@reown/appkit-wagmi-react-native').then(module => ({ 
    default: module.AppKit 
  }))
);

const LoadingWallet = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingText}>Initializing wallet...</Text>
  </View>
);

interface LazyWalletConnectProps {
  enabled?: boolean;
}

export const LazyWalletConnect: React.FC<LazyWalletConnectProps> = ({ enabled = false }) => {
  // Initialize AppKit only when component is enabled
  useEffect(() => {
    if (enabled) {
      initializeAppKit();
    }
  }, [enabled]);

  // Only render when explicitly enabled
  if (!enabled) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingWallet />}>
      <AppKit />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
  },
});
