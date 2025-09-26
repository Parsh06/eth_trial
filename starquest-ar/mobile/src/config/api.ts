export const API_CONFIG = {
  // Backend API
  BASE_URL: __DEV__ 
    ? 'http://localhost:5000/api' 
    : 'https://your-production-api.com/api',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      WALLET_LOGIN: '/auth/wallet-login',
      PROFILE: '/auth/profile',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
      STATS: '/user/stats',
    },
    QUEST: {
      LIST: '/quest',
      DETAIL: '/quest/:id',
      JOIN: '/quest/:id/join',
      LEAVE: '/quest/:id/leave',
    },
    STAR: {
      LIST: '/star',
      DETAIL: '/star/:id',
      COLLECT: '/star/:id/collect',
      NEARBY: '/star/nearby',
    },
    LEADERBOARD: {
      STARS: '/leaderboard/stars',
      QUESTS: '/leaderboard/quests',
      STREAK: '/leaderboard/streak',
      EXPERIENCE: '/leaderboard/experience',
    },
  },
  
  // WebSocket
  WS_URL: __DEV__ 
    ? 'ws://localhost:5000' 
    : 'wss://your-production-api.com',
  
  // Timeouts
  TIMEOUT: 10000, // 10 seconds
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

