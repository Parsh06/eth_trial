export interface Star {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  status: 'available' | 'completed' | 'locked';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  reward: {
    nftId: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    image: string;
  };
  blockchainData?: {
    starId: number;
    latitude: number;
    longitude: number;
    starType: number;
    basePayout: string;
    radius: number;
    totalStaked: string;
    playerCount: number;
    isActive: boolean;
  };
}

export interface Challenge {
  id: string;
  starId: string;
  type: 'trivia' | 'creative' | 'puzzle' | 'ar' | 'social';
  title: string;
  description: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  timeLimit?: number;
  completed: boolean;
}

export interface User {
  id: string;
  walletAddress?: string;
  username: string;
  avatar?: string;
  stats: {
    starsFound: number;
    questsCompleted: number;
    nftsEarned: number;
    streak: number;
  };
  achievements: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'epic';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  progress: number;
  maxProgress: number;
  rewards: {
    nftId?: string;
    points: number;
  };
  timeRemaining?: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  category: 'stars' | 'nfts' | 'streaks';
}

export type AppState = 
  | { screen: "preloader" }
  | { screen: "landing" }
  | { screen: "login" }
  | { screen: "onboarding" }
  | { screen: "wallet-connect" }
  | { screen: "main"; activeTab: string; walletAddress?: string }
  | { screen: "challenge"; challengeId?: string; walletAddress?: string }
  | { screen: "reward"; rewardData?: any; walletAddress?: string };

export interface GameContextType {
  state: AppState;
  user: User | null;
  stars: Star[];
  challenges: Challenge[];
  quests: Quest[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  handlePreloaderComplete: () => void;
  handleLandingComplete: () => void;
  handleOnboardingComplete: () => void;
  handleWalletConnect: (address: string, signature?: string, message?: string) => void;
  handleTabChange: (tab: string) => void;
  handleChallengeSelect: (id: string) => void;
  handleChallengeComplete: (success: boolean) => void;
  handleDisconnectWallet: () => void;
  handleQRScan: (data: string) => void;
  // Blockchain methods
  connectHederaWallet: (privateKey: string) => Promise<boolean>;
  createStake: (starId: number, amount: string) => Promise<any>;
  completeChallenge: (starId: number, success: boolean, proof?: string) => Promise<any>;
  getPlayerStats: () => Promise<any>;
  getContractStats: () => Promise<any>;
}
