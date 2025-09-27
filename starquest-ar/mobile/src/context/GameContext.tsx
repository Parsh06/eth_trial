import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, Star, Challenge, Quest, LeaderboardEntry, GameContextType } from '../types';
import apiService from '../services/api';
import websocketService from '../services/websocket';

// Mock data
const mockUser: User = {
  id: '1',
  username: 'StarHunter',
  stats: {
    starsFound: 3,
    questsCompleted: 7,
    nftsEarned: 3,
    streak: 5
  },
  achievements: ['First Star', 'Quick Learner', 'Streak Master']
};

const mockStars: Star[] = [
  {
    id: '1',
    name: 'Alpha Star',
    description: 'The first star in your journey',
    position: { x: 1, y: 1 },
    status: 'completed',
    difficulty: 'beginner',
    reward: {
      nftId: 'nft-1',
      name: 'Alpha Star NFT',
      rarity: 'common',
      image: 'https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=Alpha'
    }
  },
  {
    id: '2',
    name: 'Beta Star',
    description: 'A challenging star for the brave',
    position: { x: 2, y: 1 },
    status: 'completed',
    difficulty: 'intermediate',
    reward: {
      nftId: 'nft-2',
      name: 'Beta Star NFT',
      rarity: 'rare',
      image: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=Beta'
    }
  },
  {
    id: '3',
    name: 'Gamma Star',
    description: 'The ultimate test of skill',
    position: { x: 3, y: 1 },
    status: 'available',
    difficulty: 'expert',
    reward: {
      nftId: 'nft-3',
      name: 'Gamma Star NFT',
      rarity: 'epic',
      image: 'https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=Gamma'
    }
  },
  {
    id: '4',
    name: 'Delta Star',
    description: 'Hidden in the shadows',
    position: { x: 1, y: 2 },
    status: 'locked',
    difficulty: 'intermediate',
    reward: {
      nftId: 'nft-4',
      name: 'Delta Star NFT',
      rarity: 'rare',
      image: 'https://via.placeholder.com/200x200/EF4444/FFFFFF?text=Delta'
    }
  }
];

const mockChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    starId: '3',
    type: 'trivia',
    title: 'Space Knowledge',
    description: 'Test your knowledge about the cosmos',
    question: 'What is the closest star to Earth?',
    options: ['Sun', 'Proxima Centauri', 'Alpha Centauri', 'Sirius'],
    correctAnswer: 'Sun',
    hint: 'It provides light and warmth to our planet',
    timeLimit: 30,
    completed: false
  }
];

const mockQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Daily Star Hunt',
    description: 'Find 3 stars today',
    type: 'daily',
    difficulty: 'beginner',
    progress: 2,
    maxProgress: 3,
    rewards: { points: 100 },
    timeRemaining: 86400,
    completed: false
  },
  {
    id: 'quest-2',
    title: 'Weekly Explorer',
    description: 'Complete 10 challenges this week',
    type: 'weekly',
    difficulty: 'intermediate',
    progress: 7,
    maxProgress: 10,
    rewards: { points: 500, nftId: 'weekly-nft' },
    timeRemaining: 259200,
    completed: false
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: { ...mockUser, username: 'StarMaster' },
    score: 1500,
    category: 'stars'
  },
  {
    rank: 2,
    user: mockUser,
    score: 1200,
    category: 'stars'
  },
  {
    rank: 3,
    user: { ...mockUser, username: 'CosmicHunter' },
    score: 1000,
    category: 'stars'
  }
];

type GameAction = 
  | { type: 'PRELOADER_COMPLETE' }
  | { type: 'LANDING_COMPLETE' }
  | { type: 'ONBOARDING_COMPLETE' }
  | { type: 'WALLET_CONNECT'; address: string }
  | { type: 'TAB_CHANGE'; tab: string }
  | { type: 'CHALLENGE_SELECT'; id: string }
  | { type: 'CHALLENGE_COMPLETE'; success: boolean }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'QR_SCAN'; data: string };

const initialState: AppState = { screen: "preloader" };

function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'PRELOADER_COMPLETE':
      return { screen: "landing" };
    case 'LANDING_COMPLETE':
      return { screen: "login" };
    case 'ONBOARDING_COMPLETE':
      return { screen: "wallet-connect" };
    case 'WALLET_CONNECT':
      return { screen: "main", activeTab: "home", walletAddress: action.address };
    case 'TAB_CHANGE':
      if (state.screen === "main") {
        return { ...state, activeTab: action.tab };
      }
      return state;
    case 'CHALLENGE_SELECT':
      if (state.screen === "main") {
        return { ...state, screen: "challenge", challengeId: action.id };
      }
      return state;
    case 'CHALLENGE_COMPLETE':
      if (state.screen === "challenge") {
        return { ...state, screen: "reward" };
      }
      return state;
    case 'DISCONNECT_WALLET':
      return { screen: "preloader" };
    case 'QR_SCAN':
      // Handle QR scan logic
      return state;
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [user, setUser] = React.useState<User | null>(null);
  const [stars, setStars] = React.useState<Star[]>([]);
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load user profile if authenticated
      const userProfile = await apiService.getUserProfile();
      if (userProfile.success) {
        setUser(userProfile.user);
      }
      
      // Load initial data
      const [starsData, questsData, leaderboardData] = await Promise.all([
        apiService.getStars(),
        apiService.getQuests(),
        apiService.getLeaderboard('stars'),
      ]);
      
      setStars(starsData.stars || []);
      setQuests(questsData.quests || []);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data');
      // Fallback to mock data
      setUser(mockUser);
      setStars(mockStars);
      setQuests(mockQuests);
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const handlePreloaderComplete = () => {
    dispatch({ type: 'PRELOADER_COMPLETE' });
  };

  const handleLandingComplete = () => {
    console.log('Landing complete button clicked!');
    dispatch({ type: 'LANDING_COMPLETE' });
  };

  const handleOnboardingComplete = () => {
    dispatch({ type: 'ONBOARDING_COMPLETE' });
  };

  const handleWalletConnect = async (address: string, signature?: string, message?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Connecting wallet:', address);
      
      // Try to authenticate with the backend API
      let userData;
      try {
        const authResponse = await apiService.walletLogin(address, signature || '', message || '');
        if (authResponse.success) {
          userData = {
            id: authResponse.user.id,
            walletAddress: authResponse.user.walletAddress,
            username: authResponse.user.username,
            stats: {
              starsFound: authResponse.user.starsCollected || 0,
              questsCompleted: authResponse.user.questsCompleted || 0,
              nftsEarned: authResponse.user.nftsEarned || 0,
              streak: authResponse.user.streak || 0
            },
            achievements: authResponse.user.achievements || ['First Star']
          };
          console.log('Backend authentication successful');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (apiError) {
        console.log('Backend authentication failed, using mock data:', apiError.message);
        // Fallback to mock data if backend is not available
        userData = {
          id: 'user-' + Date.now(),
          walletAddress: address,
          username: 'StarHunter' + Math.floor(Math.random() * 1000),
          stats: {
            starsFound: Math.floor(Math.random() * 10),
            questsCompleted: Math.floor(Math.random() * 5),
            nftsEarned: Math.floor(Math.random() * 3),
            streak: Math.floor(Math.random() * 7)
          },
          achievements: ['First Star', 'Quick Learner', 'Streak Master']
        };
      }
      
      setUser(userData);
      console.log('Wallet connected successfully, navigating to home...');
      dispatch({ type: 'WALLET_CONNECT', address });
      
      // Store user data in AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        await AsyncStorage.setItem('wallet_address', address);
        console.log('User data stored successfully');
      } catch (storageError) {
        console.warn('Failed to store user data:', storageError);
      }
      
    } catch (error) {
      console.error('Wallet connect error:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    dispatch({ type: 'TAB_CHANGE', tab });
  };

  const handleChallengeSelect = (id: string) => {
    dispatch({ type: 'CHALLENGE_SELECT', id });
  };

  const handleChallengeComplete = (success: boolean) => {
    dispatch({ type: 'CHALLENGE_COMPLETE', success });
  };

  const handleDisconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' });
  };

  const handleQRScan = (data: string) => {
    dispatch({ type: 'QR_SCAN', data });
  };

  const value: GameContextType = {
    state,
    user,
    stars,
    challenges,
    quests,
    leaderboard,
    loading,
    error,
    handlePreloaderComplete,
    handleLandingComplete,
    handleOnboardingComplete,
    handleWalletConnect,
    handleTabChange,
    handleChallengeSelect,
    handleChallengeComplete,
    handleDisconnectWallet,
    handleQRScan
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
