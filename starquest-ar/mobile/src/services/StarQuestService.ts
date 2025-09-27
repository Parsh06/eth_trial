import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/environment';

// Import ABI files
import StarQuestABI from '../abis/StarQuest.json';
import StarQuestOracleABI from '../abis/StarQuestOracle.json';
import StarQuestHTSABI from '../abis/StarQuestHTS.json';
import StarQuestConsensusABI from '../abis/StarQuestConsensusService.json';
import StarQuestFilecoinABI from '../abis/StarQuestFilecoinStorage.json';

export interface Star {
  id: number;
  latitude: number;
  longitude: number;
  starType: number;
  basePayout: string;
  radius: number;
  isActive: boolean;
  totalStaked: string;
  playerCount: number;
}

export interface Stake {
  player: string;
  amount: string;
  timestamp: number;
  isActive: boolean;
}

export interface PlayerStats {
  totalStaked: string;
  totalWon: string;
  starsFound: number;
  challengesCompleted: number;
  currentStakes: Stake[];
}

export interface ContractStats {
  totalStars: number;
  totalStaked: string;
  totalPlayers: number;
  isPaused: boolean;
}

export interface TransactionResult {
  success: boolean;
  transaction?: ethers.TransactionResponse;
  error?: string;
  hash?: string;
}

export class StarQuestService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private contracts: {
    starQuest: ethers.Contract;
    oracle: ethers.Contract;
    hts: ethers.Contract;
    consensus: ethers.Contract;
    filecoin: ethers.Contract;
  } | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(ENV.HEDERA_RPC_URL);
    this.initializeContracts();
  }

  private initializeContracts() {
    try {
      // Initialize contracts without signer first (for read operations)
      this.contracts = {
        starQuest: new ethers.Contract(
          ENV.CONTRACTS.STARQUEST_CORE,
          StarQuestABI.abi,
          this.provider
        ),
        oracle: new ethers.Contract(
          ENV.CONTRACTS.STARQUEST_ORACLE,
          StarQuestOracleABI.abi,
          this.provider
        ),
        hts: new ethers.Contract(
          ENV.CONTRACTS.STARQUEST_HTS,
          StarQuestHTSABI.abi,
          this.provider
        ),
        consensus: new ethers.Contract(
          ENV.CONTRACTS.STARQUEST_CONSENSUS,
          StarQuestConsensusABI.abi,
          this.provider
        ),
        filecoin: new ethers.Contract(
          ENV.CONTRACTS.STARQUEST_FILECOIN,
          StarQuestFilecoinABI.abi,
          this.provider
        ),
      };
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  }

  async connectWallet(privateKey: string): Promise<boolean> {
    try {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      // Update contracts with signer for write operations
      if (this.contracts) {
        this.contracts.starQuest = this.contracts.starQuest.connect(this.signer);
        this.contracts.oracle = this.contracts.oracle.connect(this.signer);
        this.contracts.hts = this.contracts.hts.connect(this.signer);
        this.contracts.consensus = this.contracts.consensus.connect(this.signer);
        this.contracts.filecoin = this.contracts.filecoin.connect(this.signer);
      }

      // Store private key securely
      await AsyncStorage.setItem('hedera_private_key', privateKey);
      
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.signer = null;
    await AsyncStorage.removeItem('hedera_private_key');
    
    // Reinitialize contracts without signer
    this.initializeContracts();
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) {
      const privateKey = await AsyncStorage.getItem('hedera_private_key');
      if (privateKey) {
        await this.connectWallet(privateKey);
      }
    }
    return this.signer?.address || null;
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }
      
      const balance = await this.provider.getBalance(this.signer.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // Star Management
  async getAllStars(): Promise<Star[]> {
    try {
      if (!this.contracts?.starQuest) {
        throw new Error('Contracts not initialized');
      }

      const starCount = await this.contracts.starQuest.getStarCount();
      const stars: Star[] = [];

      for (let i = 0; i < Number(starCount); i++) {
        try {
          const star = await this.contracts.starQuest.getStar(i);
          stars.push({
            id: i,
            latitude: Number(star.latitude) / 1000000, // Convert from microdegrees
            longitude: Number(star.longitude) / 1000000,
            starType: Number(star.starType),
            basePayout: ethers.formatEther(star.basePayout),
            radius: Number(star.radius),
            isActive: star.isActive,
            totalStaked: ethers.formatEther(star.totalStaked),
            playerCount: Number(star.playerCount),
          });
        } catch (error) {
          console.warn(`Failed to get star ${i}:`, error);
        }
      }

      return stars;
    } catch (error) {
      console.error('Failed to get all stars:', error);
      return [];
    }
  }

  async getStar(starId: number): Promise<Star | null> {
    try {
      if (!this.contracts?.starQuest) {
        throw new Error('Contracts not initialized');
      }

      const star = await this.contracts.starQuest.getStar(starId);
      return {
        id: starId,
        latitude: Number(star.latitude) / 1000000,
        longitude: Number(star.longitude) / 1000000,
        starType: Number(star.starType),
        basePayout: ethers.formatEther(star.basePayout),
        radius: Number(star.radius),
        isActive: star.isActive,
        totalStaked: ethers.formatEther(star.totalStaked),
        playerCount: Number(star.playerCount),
      };
    } catch (error) {
      console.error(`Failed to get star ${starId}:`, error);
      return null;
    }
  }

  // Staking Operations
  async createStake(starId: number, amount: string): Promise<TransactionResult> {
    try {
      if (!this.contracts?.starQuest || !this.signer) {
        throw new Error('Wallet not connected or contracts not initialized');
      }

      const amountWei = ethers.parseEther(amount);
      
      // Check if amount is within limits
      const minStake = ethers.parseEther(ENV.GAME_SETTINGS.MIN_STAKE);
      const maxStake = ethers.parseEther(ENV.GAME_SETTINGS.MAX_STAKE);
      
      if (amountWei < minStake) {
        throw new Error(`Minimum stake is ${ENV.GAME_SETTINGS.MIN_STAKE} HBAR`);
      }
      
      if (amountWei > maxStake) {
        throw new Error(`Maximum stake is ${ENV.GAME_SETTINGS.MAX_STAKE} HBAR`);
      }

      const transaction = await this.contracts.starQuest.createStake(starId, {
        value: amountWei,
      });

      return {
        success: true,
        transaction,
        hash: transaction.hash,
      };
    } catch (error) {
      console.error('Failed to create stake:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStarStakes(starId: number): Promise<Stake[]> {
    try {
      if (!this.contracts?.starQuest) {
        throw new Error('Contracts not initialized');
      }

      const stakes = await this.contracts.starQuest.getStarStakes(starId);
      return stakes.map((stake: any) => ({
        player: stake.player,
        amount: ethers.formatEther(stake.amount),
        timestamp: Number(stake.timestamp),
        isActive: stake.isActive,
      }));
    } catch (error) {
      console.error(`Failed to get stakes for star ${starId}:`, error);
      return [];
    }
  }

  // Challenge Operations
  async completeChallenge(
    starId: number,
    success: boolean,
    proof?: string
  ): Promise<TransactionResult> {
    try {
      if (!this.contracts?.starQuest || !this.signer) {
        throw new Error('Wallet not connected or contracts not initialized');
      }

      const transaction = await this.contracts.starQuest.completeChallenge(
        starId,
        success,
        proof || '0x'
      );

      return {
        success: true,
        transaction,
        hash: transaction.hash,
      };
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Player Statistics
  async getPlayerStats(playerAddress?: string): Promise<PlayerStats | null> {
    try {
      if (!this.contracts?.starQuest) {
        throw new Error('Contracts not initialized');
      }

      const address = playerAddress || this.signer?.address;
      if (!address) {
        throw new Error('No player address provided');
      }

      const stats = await this.contracts.starQuest.getPlayerStats(address);
      const stakes = await this.contracts.starQuest.getPlayerStakes(address);

      return {
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalWon: ethers.formatEther(stats.totalWon),
        starsFound: Number(stats.starsFound),
        challengesCompleted: Number(stats.challengesCompleted),
        currentStakes: stakes.map((stake: any) => ({
          player: stake.player,
          amount: ethers.formatEther(stake.amount),
          timestamp: Number(stake.timestamp),
          isActive: stake.isActive,
        })),
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      return null;
    }
  }

  // Contract Management
  async getContractStats(): Promise<ContractStats | null> {
    try {
      if (!this.contracts?.starQuest) {
        throw new Error('Contracts not initialized');
      }

      const stats = await this.contracts.starQuest.getContractStats();
      return {
        totalStars: Number(stats.totalStars),
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalPlayers: Number(stats.totalPlayers),
        isPaused: stats.isPaused,
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      return null;
    }
  }

  // Event Listening
  startEventListening(callbacks: {
    onStaked?: (event: any) => void;
    onChallengeCompleted?: (event: any) => void;
    onStarAdded?: (event: any) => void;
    onRewardPaid?: (event: any) => void;
  }): void {
    if (!this.contracts?.starQuest) {
      console.error('Contracts not initialized');
      return;
    }

    try {
      // Listen for Staked events
      if (callbacks.onStaked) {
        this.contracts.starQuest.on('Staked', callbacks.onStaked);
      }

      // Listen for ChallengeCompleted events
      if (callbacks.onChallengeCompleted) {
        this.contracts.starQuest.on('ChallengeCompleted', callbacks.onChallengeCompleted);
      }

      // Listen for StarAdded events
      if (callbacks.onStarAdded) {
        this.contracts.starQuest.on('StarAdded', callbacks.onStarAdded);
      }

      // Listen for RewardPaid events
      if (callbacks.onRewardPaid) {
        this.contracts.starQuest.on('RewardPaid', callbacks.onRewardPaid);
      }
    } catch (error) {
      console.error('Failed to start event listening:', error);
    }
  }

  stopEventListening(): void {
    if (!this.contracts?.starQuest) {
      return;
    }

    try {
      this.contracts.starQuest.removeAllListeners();
    } catch (error) {
      console.error('Failed to stop event listening:', error);
    }
  }

  // Utility Methods
  async waitForTransaction(hash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.waitForTransaction(hash);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      return null;
    }
  }

  async getTransactionStatus(hash: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    receipt?: ethers.TransactionReceipt;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(hash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        receipt,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return { status: 'failed' };
    }
  }

  // Network Information
  getNetworkInfo() {
    return {
      name: 'Hedera Testnet',
      chainId: ENV.HEDERA_CHAIN_ID,
      rpcUrl: ENV.HEDERA_RPC_URL,
      explorer: ENV.HEDERA_EXPLORER,
    };
  }

  // Contract Addresses
  getContractAddresses() {
    return ENV.CONTRACTS;
  }
}

// Create singleton instance
export const starQuestService = new StarQuestService();
