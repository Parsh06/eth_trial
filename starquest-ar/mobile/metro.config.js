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

// Optimize resolver performance
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Skip heavy node_modules scanning for common patterns
  if (moduleName.includes('@noble/hashes') || moduleName.includes('multiformats')) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

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

// Enhanced caching
config.cacheStores = [
  {
    name: 'FileStore',
    options: {
      cacheDirectory: require('path').join(__dirname, 'node_modules', '.cache', 'metro'),
    },
  },
];

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

module.exports = config;
