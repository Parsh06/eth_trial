const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper module resolution for WalletConnect
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for crypto and other node modules
config.resolver.alias = {
  crypto: 'react-native-crypto-js',
  stream: 'readable-stream',
  url: 'react-native-url-polyfill',
  buffer: 'buffer',
  process: 'process/browser',
  _stream_duplex: 'readable-stream/duplex',
  _stream_passthrough: 'readable-stream/passthrough',
  _stream_readable: 'readable-stream/readable',
  _stream_transform: 'readable-stream/transform',
  _stream_writable: 'readable-stream/writable',
};

// Ensure these extensions are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Handle node modules that might not be compatible with React Native
config.resolver.unstable_enableSymlinks = false;

// Add globals for React Native
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Reduce file watching for systems with limited watchers
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ["hg.update", "hg.update-merge"],
  },
  healthCheck: {
    enabled: true,
    interval: 10000,
    timeout: 5000,
  },
};

// Limit the scope of file watching
config.watchFolders = [];

module.exports = config;
