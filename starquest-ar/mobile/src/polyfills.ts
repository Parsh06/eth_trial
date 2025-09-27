// Essential polyfills for React Native - loaded synchronously
import 'react-native-get-random-values';

// Minimal polyfills setup
if (typeof global.global === 'undefined') {
  global.global = global;
}

// Set up essential globals immediately for WalletConnect
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import process from 'process/browser';
if (typeof global.process === 'undefined') {
  global.process = process;
}

// Load WalletConnect compatibility immediately to prevent subscription errors
import '@walletconnect/react-native-compat';

// Lazy load remaining polyfills
const loadRemainingPolyfills = () => {
  return import('react-native-url-polyfill/auto').catch(console.warn);
};

// Load remaining polyfills after startup
setTimeout(() => {
  loadRemainingPolyfills();
}, 50); 