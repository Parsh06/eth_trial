import { ethers } from 'ethers';
import { Platform, Alert } from 'react-native';
import StarQuestABI from '../abis/StarQuest.json';

export interface StakingResult {
  success: boolean;
  transactionHash?: string;
  challengeId?: number;
  error?: string;
}

export interface ChallengeInfo {
  id: number;
  player: string;
  stakeAmount: string;
  status: string;
  starId: number;
  starType: string;
  createdAt: Date;
}

export class StarQuestWeb3Service {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  
  // Contract addresses (update these with your deployed contracts)
  private readonly CONTRACT_ADDRESS = '0xBE37915340633f6E417EdE7Af996bE073eA269fE';
  private readonly RPC_URL = 'https://testnet.hashio.io/api'; // Hedera Testnet
  
  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.RPC_URL);
      console.log('✅ StarQuest Web3 service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Web3 service:', error);
    }
  }

  /**
   * Connect wallet using private key (for demo purposes)
   * In production, use proper wallet connection methods
   */
  async connectWallet(privateKey: string): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        StarQuestABI,
        this.wallet
      );

      console.log('✅ Wallet connected:', await this.wallet.getAddress());
      return true;
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      return false;
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }
    return await this.wallet.getAddress();
  }

  /**
   * Get wallet balance in HBAR/ETH
   */
  async getBalance(): Promise<string> {
    if (!this.wallet || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(await this.wallet.getAddress());
    return ethers.formatEther(balance);
  }

  /**
   * Stake crypto for a challenge
   */
  async createStake(starId: number, stakeAmount: string): Promise<StakingResult> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not connected');
      }

      console.log(`💰 Creating stake: ${stakeAmount} HBAR for star ${starId}`);

      // Convert stake amount to wei
      const stakeAmountWei = ethers.parseEther(stakeAmount);

      // Call the createStake function
      const tx = await this.contract.createStake(starId, {
        value: stakeAmountWei,
        gasLimit: 500000 // Set appropriate gas limit
      });

      console.log('📝 Transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);

      // Get the challenge ID from the event
      const challengeId = await this.getLatestChallengeId();

      return {
        success: true,
        transactionHash: tx.hash,
        challengeId: challengeId
      };

    } catch (error: any) {
      console.error('❌ Staking failed:', error);
      
      let errorMessage = 'Staking failed';
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient balance for staking';
      } else if (error.message.includes('Star not active')) {
        errorMessage = 'This star is not available for challenges';
      } else if (error.message.includes('Already have active stake')) {
        errorMessage = 'You already have an active stake';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(): Promise<any> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not connected');
      }

      const address = await this.wallet.getAddress();
      const stats = await this.contract.playerStats(address);

      return {
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalWon: ethers.formatEther(stats.totalWon),
        challengesCompleted: stats.challengesCompleted.toString(),
        challengesFailed: stats.challengesFailed.toString(),
        currentStreak: stats.currentStreak.toString(),
        longestStreak: stats.longestStreak.toString()
      };
    } catch (error) {
      console.error('❌ Failed to get player stats:', error);
      throw error;
    }
  }

  /**
   * Get star information
   */
  async getStarInfo(starId: number): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not connected');
      }

      const star = await this.contract.stars(starId);
      const multiplier = await this.contract.getStarMultiplier(star.starType);

      return {
        id: star.id.toString(),
        latitude: star.latitude.toString(),
        longitude: star.longitude.toString(),
        starType: this.getStarTypeName(star.starType),
        active: star.active,
        multiplier: multiplier.toString(),
        challengesCompleted: star.challengesCompleted.toString(),
        totalStaked: ethers.formatEther(star.totalStaked)
      };
    } catch (error) {
      console.error('❌ Failed to get star info:', error);
      throw error;
    }
  }

  /**
   * Get challenge information
   */
  async getChallengeInfo(challengeId: number): Promise<ChallengeInfo> {
    try {
      if (!this.contract) {
        throw new Error('Contract not connected');
      }

      const challenge = await this.contract.challenges(challengeId);

      return {
        id: challenge.id.toNumber(),
        player: challenge.player,
        stakeAmount: ethers.formatEther(challenge.stakeAmount),
        status: this.getChallengeStatusName(challenge.status),
        starId: challenge.starId.toNumber(),
        starType: this.getStarTypeName(challenge.starType),
        createdAt: new Date(challenge.createdAt.toNumber() * 1000)
      };
    } catch (error) {
      console.error('❌ Failed to get challenge info:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  startEventListening(callbacks: {
    onStaked?: (event: any) => void;
    onChallengeCompleted?: (event: any) => void;
    onError?: (error: any) => void;
  }) {
    if (!this.contract) {
      console.error('❌ Contract not connected');
      return;
    }

    console.log('🎧 Starting event listeners...');

    // Listen to Staked events
    this.contract.on('Staked', (player, amount, challengeId, event) => {
      console.log('💰 Staked event:', { player, amount: ethers.formatEther(amount), challengeId: challengeId.toString() });
      if (callbacks.onStaked) {
        callbacks.onStaked({
          player,
          amount: ethers.formatEther(amount),
          challengeId: challengeId.toString(),
          transactionHash: event.transactionHash
        });
      }
    });

    // Listen to ChallengeCompleted events
    this.contract.on('ChallengeCompleted', (challengeId, player, success, payout, event) => {
      console.log('🎯 Challenge completed:', { 
        challengeId: challengeId.toString(), 
        player, 
        success, 
        payout: ethers.formatEther(payout) 
      });
      if (callbacks.onChallengeCompleted) {
        callbacks.onChallengeCompleted({
          challengeId: challengeId.toString(),
          player,
          success,
          payout: ethers.formatEther(payout),
          transactionHash: event.transactionHash
        });
      }
    });

    // Handle errors
    this.contract.on('error', (error) => {
      console.error('❌ Contract error:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });
  }

  /**
   * Stop listening to events
   */
  stopEventListening() {
    if (this.contract) {
      this.contract.removeAllListeners();
      console.log('🛑 Event listeners stopped');
    }
  }

  // Helper methods
  private getStarTypeName(starType: number): string {
    const types = ['Common', 'Rare', 'Epic', 'Legendary'];
    return types[starType] || 'Unknown';
  }

  private getChallengeStatusName(status: number): string {
    const statuses = ['Active', 'Completed', 'Failed', 'Disputed'];
    return statuses[status] || 'Unknown';
  }

  private async getLatestChallengeId(): Promise<number> {
    // This is a simplified method - in production you'd parse events
    // For now, we'll return a mock ID
    return Math.floor(Math.random() * 1000);
  }
}

// Export singleton instance
export const starQuestWeb3Service = new StarQuestWeb3Service();
