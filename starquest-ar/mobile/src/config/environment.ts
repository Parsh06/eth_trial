// Environment configuration
export const ENV = {
  // MetaMask Configuration
  METAMASK_API_KEY: '38bb2d147c8a4df4a9fbfac65d90ba7c',
  
  // App Configuration
  APP_NAME: 'StarQuest AR',
  APP_VERSION: '1.0.0',
  APP_ENVIRONMENT: 'development',
  
  // Web3 Configuration
  ETHEREUM_NETWORK: 'mainnet',
  CHAIN_ID: '1',
  
  // Hedera Configuration
  HEDERA_NETWORK: 'testnet',
  HEDERA_CHAIN_ID: '296',
  HEDERA_RPC_URL: 'https://testnet.hashio.io/api',
  HEDERA_EXPLORER: 'https://hashscan.io/testnet',
  
  // StarQuest Contract Addresses (Hedera Testnet)
  CONTRACTS: {
    STARQUEST_CORE: '0xBE37915340633f6E417EdE7Af996bE073eA269fE',
    STARQUEST_ORACLE: '0x47daD15949705f42727cAeCBC81ed89BEDD16e9d',
    STARQUEST_HTS: '0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e',
    STARQUEST_CONSENSUS: '0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d',
    STARQUEST_FILECOIN: '0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4',
  },
  
  // Game Settings
  GAME_SETTINGS: {
    MIN_STAKE: '0.01', // HBAR
    MAX_STAKE: '10.0', // HBAR
    WIN_MULTIPLIER: 200, // 2x payout
    HOUSE_FEE: 5, // 5%
  },
  
  // API Endpoints
  API_BASE_URL: 'http://localhost:5000',
  WEBSOCKET_URL: 'ws://localhost:5000',
  
  // MetaMask SDK Configuration
  METAMASK_SDK_CONFIG: {
    dappMetadata: {
      name: 'StarQuest AR',
      url: 'https://starquest-ar.com',
    },
    infuraAPIKey: '38bb2d147c8a4df4a9fbfac65d90ba7c',
    logging: {
      developerMode: true,
    },
    communicationServerUrl: 'https://metamask-sdk-socket.metamask.io',
    storage: {
      enabled: true,
    },
  }
} as const;
