// Essential polyfills for React Native - loaded synchronously
import 'react-native-get-random-values';

// Minimal polyfills setup
if (typeof global.global === 'undefined') {
  global.global = global;
}

// Lazy load heavy polyfills to improve startup time
const loadHeavyPolyfills = () => {
  return Promise.all([
    import('react-native-url-polyfill/auto'),
    import('buffer').then(({ Buffer }) => {
      if (typeof global.Buffer === 'undefined') {
        global.Buffer = Buffer;
      }
    }),
    import('process/browser').then((process) => {
      if (typeof global.process === 'undefined') {
        global.process = process.default;
      }
    }),
    import('@walletconnect/react-native-compat')
  ]);
};

// Initialize heavy polyfills after app startup
setTimeout(() => {
  loadHeavyPolyfills().catch(console.warn);
}, 100); 