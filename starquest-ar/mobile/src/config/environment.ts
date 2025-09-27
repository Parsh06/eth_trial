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
  
  // API Endpoints
  API_BASE_URL: 'http://localhost:3001',
  WEBSOCKET_URL: 'ws://localhost:3001',
  
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
