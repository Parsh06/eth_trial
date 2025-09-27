// based on https://github.com/expo/config-plugins/issues/123#issuecomment-1746757954
// Plugin to enable wallet detection on Android by adding queries to AndroidManifest.xml

const {
  AndroidConfig,
  withAndroidManifest,
  createRunOncePlugin,
} = require("expo/config-plugins");

const queries = {
  package: [
    // Popular wallet package names for detection
    { $: { "android:name": "com.wallet.crypto.trustapp" } },      // Trust Wallet
    { $: { "android:name": "io.metamask" } },                     // MetaMask
    { $: { "android:name": "me.rainbow" } },                      // Rainbow Wallet
    { $: { "android:name": "io.zerion.android" } },               // Zerion
    { $: { "android:name": "io.gnosis.safe" } },                  // Gnosis Safe
    { $: { "android:name": "com.uniswap.mobile" } },              // Uniswap Wallet
    { $: { "android:name": "org.ethereum.mist" } },               // Mist Browser
    { $: { "android:name": "com.coinbase.android" } },            // Coinbase Wallet
    { $: { "android:name": "com.binance.dev" } },                 // Binance
    { $: { "android:name": "io.argent.wallet" } },                // Argent
    { $: { "android:name": "com.myetherwallet.mewwallet" } },     // MEW wallet
    { $: { "android:name": "com.alphawallet" } },                 // AlphaWallet
    { $: { "android:name": "com.ledger.live" } },                 // Ledger Live
    { $: { "android:name": "com.bitkeep.wallet" } },              // BitKeep
    { $: { "android:name": "com.mathwallet.android" } },          // MathWallet
    { $: { "android:name": "com.tokenpocket.wallet" } },          // TokenPocket
  ],
};

/**
 * @param {import('@expo/config-plugins').ExportedConfig} config
 */
const withAndroidManifestService = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest = {
      ...config.modResults.manifest,
      queries,
    };

    return config;
  });
};

module.exports = createRunOncePlugin(
  withAndroidManifestService,
  "withAndroidManifestService",
  "1.0.0"
);
