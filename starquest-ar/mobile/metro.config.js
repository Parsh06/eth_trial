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
  // Fix @noble/hashes resolution issues
  '@noble/hashes/crypto': '@noble/hashes/crypto.js',
  '@noble/hashes': '@noble/hashes/index.js',
  // Fix multiformats resolution issues
  'multiformats/cjs/src/basics': 'multiformats/src/basics.js',
  'multiformats': 'multiformats/index.js',
};

// Ensure these extensions are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Handle node modules that might not be compatible with React Native
config.resolver.unstable_enableSymlinks = false;

// Skip problematic module resolution to speed up bundling
config.resolver.resolveRequest = null;

// Enhanced transformer with performance optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Enhanced caching - use default cache stores
// config.cacheStores is handled by Expo automatically

// Optimized file watching with reduced scope
config.watcher = {
  ...config.watcher,
  additionalExts: ['cjs'],
  watchman: {
    deferStates: ["hg.update", "hg.update-merge"],
  },
  healthCheck: {
    enabled: true,
    interval: 15000,
    timeout: 8000,
  },
};

// Exclude heavy directories from watching
config.watchFolders = [];

// Performance optimizations
config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length * 0.8));

// Exclude heavy modules from initial bundle
config.resolver.blockList = [
  /node_modules\/@noble\/hashes\/.*\.js$/,
  /node_modules\/multiformats\/.*\.js$/,
  /node_modules\/@walletconnect\/.*\/node_modules\/@noble\/.*\.js$/,
];

module.exports = config;
