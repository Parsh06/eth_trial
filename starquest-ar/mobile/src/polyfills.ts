// Polyfills for crypto and other node modules in React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Set up global Buffer
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Set up global process
import process from 'process/browser';
if (typeof global.process === 'undefined') {
  global.process = process;
}

// Set up global for React Native
if (typeof global.global === 'undefined') {
  global.global = global;
}

// WalletConnect React Native compatibility
import '@walletconnect/react-native-compat'; 