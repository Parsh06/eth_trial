// Minimal polyfills for React Native - NO crypto dependencies
import 'react-native-get-random-values';

// Basic globals only
if (typeof global.global === 'undefined') {
  global.global = global;
}
