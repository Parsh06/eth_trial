// StarQuest Integration Library
// Complete client for interacting with StarQuest smart contracts on Hedera
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

// Contract addresses on Hedera Testnet
export const STARQUEST_CONTRACTS = {
  core: "0xBE37915340633f6E417EdE7Af996bE073eA269fE",
  oracle: "0x47daD15949705f42727cAeCBC81ed89BEDD16e9d",
  hts: "0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e",
  consensus: "0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d",
  filecoin: "0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4"
};

// Network configurations
export const HEDERA_NETWORKS = {
  testnet: {
    rpcUrl: "https://testnet.hashio.io/api",
    chainId: 296,
    name: "Hedera Testnet",
    explorer: "https://hashscan.io/testnet"
  },
  mainnet: {
    rpcUrl: "https://mainnet.hashio.io/api", 
    chainId: 295,
    name: "Hedera Mainnet",
    explorer: "https://hashscan.io/mainnet"
  }
};

// Enum mappings
export const STAR_TYPES = {
  COMMON: 0,
  RARE: 1, 
  EPIC: 2,
  LEGENDARY: 3
};

export const CHALLENGE_STATUS = {
  ACTIVE: 0,
  COMPLETED: 1,
  FAILED: 2,
  DISPUTED: 3
};

export const EVENT_TYPES = {
  CHALLENGE_CREATED: 0,
  CHALLENGE_COMPLETED: 1,
  STAR_DISCOVERED: 2,
  ACHIEVEMENT_UNLOCKED: 3
};

/**
 * Main StarQuest client for interacting with all contracts
 */
export class StarQuestClient {
  constructor(options = {}) {
    this.network = options.network || 'testnet';
    this.privateKey = options.privateKey || process.env.HEDERA_OPERATOR_PRIVATE_KEY;
    this.abiPath = options.abiPath || path.join(__dirname, '../abis');
    
    this.networkConfig = HEDERA_NETWORKS[this.network];
    if (!this.networkConfig) {
      throw new Error(`Unsupported network: ${this.network}`);
    }

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
    
    // Initialize wallet if private key provided
    if (this.privateKey) {
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    }

    // Load ABIs and create contract instances
    this._loadContracts();
  }

  _loadContracts() {
    try {
      // Load ABIs
      const coreABI = JSON.parse(fs.readFileSync(path.join(this.abiPath, 'StarQuest.json'), 'utf8'));
      const oracleABI = JSON.parse(fs.readFileSync(path.join(this.abiPath, 'StarQuestOracle.json'), 'utf8'));
      const htsABI = JSON.parse(fs.readFileSync(path.join(this.abiPath, 'StarQuestHTS.json'), 'utf8'));
      const consensusABI = JSON.parse(fs.readFileSync(path.join(this.abiPath, 'StarQuestConsensusService.json'), 'utf8'));
      const filecoinABI = JSON.parse(fs.readFileSync(path.join(this.abiPath, 'StarQuestFilecoinStorage.json'), 'utf8'));

      // Create contract instances
      const signer = this.wallet || this.provider;
      
      this.contracts = {
        core: new ethers.Contract(STARQUEST_CONTRACTS.core, coreABI, signer),
        oracle: new ethers.Contract(STARQUEST_CONTRACTS.oracle, oracleABI, signer),
        hts: new ethers.Contract(STARQUEST_CONTRACTS.hts, htsABI, signer),
        consensus: new ethers.Contract(STARQUEST_CONTRACTS.consensus, consensusABI, signer),
        filecoin: new ethers.Contract(STARQUEST_CONTRACTS.filecoin, filecoinABI, signer)
      };
    } catch (error) {
      throw new Error(`Failed to load contracts: ${error.message}`);
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Get wallet address
   */
  async getAddress() {
    if (!this.wallet) {
      throw new Error("Wallet not initialized. Provide private key in constructor.");
    }
    return await this.wallet.getAddress();
  }

  /**
   * Get account balance in HBAR
   */
  async getBalance(address = null) {
    const addr = address || await this.getAddress();
    const balance = await this.provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  /**
   * Get star type name from enum value
   */
  getStarTypeName(starType) {
    const types = ['Common', 'Rare', 'Epic', 'Legendary'];
    return types[starType] || 'Unknown';
  }

  /**
   * Get challenge status name from enum value
   */
  getChallengeStatusName(status) {
    const statuses = ['Active', 'Completed', 'Failed', 'Disputed'];
    return statuses[status] || 'Unknown';
  }

  // ========== CORE CONTRACT FUNCTIONS ==========

  /**
   * Get player statistics
   */
  async getPlayerStats(playerAddress = null) {
    try {
      const address = playerAddress || await this.getAddress();
      const stats = await this.contracts.core.playerStats(address);
      
      return {
        address,
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalWon: ethers.formatEther(stats.totalWon),
        challengesCompleted: stats.challengesCompleted.toString(),
        challengesFailed: stats.challengesFailed.toString(),
        currentStreak: stats.currentStreak.toString(),
        longestStreak: stats.longestStreak.toString(),
        lastPlayedTimestamp: new Date(Number(stats.lastPlayedTimestamp) * 1000)
      };
    } catch (error) {
      throw new Error(`Failed to get player stats: ${error.message}`);
    }
  }

  /**
   * Get contract configuration
   */
  async getContractInfo() {
    try {
      const [minimumStake, maximumStake, winMultiplier, houseFeePercent, owner] = await Promise.all([
        this.contracts.core.minimumStake(),
        this.contracts.core.maximumStake(),
        this.contracts.core.winMultiplier(),
        this.contracts.core.houseFeePercent(),
        this.contracts.core.owner()
      ]);

      return {
        minimumStake: ethers.formatEther(minimumStake),
        maximumStake: ethers.formatEther(maximumStake),
        winMultiplier: winMultiplier.toString(),
        houseFeePercent: houseFeePercent.toString(),
        owner
      };
    } catch (error) {
      throw new Error(`Failed to get contract info: ${error.message}`);
    }
  }

  /**
   * Get star information
   */
  async getStar(starId) {
    try {
      const star = await this.contracts.core.stars(starId);
      
      return {
        id: star.id.toString(),
        latitude: star.latitude.toString(),
        longitude: star.longitude.toString(),
        radius: star.radius.toString(),
        starType: this.getStarTypeName(star.starType),
        starTypeValue: star.starType,
        active: star.active,
        challengesCompleted: star.challengesCompleted.toString(),
        totalStaked: ethers.formatEther(star.totalStaked)
      };
    } catch (error) {
      throw new Error(`Failed to get star ${starId}: ${error.message}`);
    }
  }

  /**
   * Get challenge information
   */
  async getChallenge(challengeId) {
    try {
      const challenge = await this.contracts.core.challenges(challengeId);
      
      return {
        player: challenge.player,
        starId: challenge.starId.toString(),
        stakeAmount: ethers.formatEther(challenge.stakeAmount),
        status: this.getChallengeStatusName(challenge.status),
        statusValue: challenge.status,
        timestamp: new Date(Number(challenge.timestamp) * 1000),
        aiProof: challenge.aiProof
      };
    } catch (error) {
      throw new Error(`Failed to get challenge ${challengeId}: ${error.message}`);
    }
  }

  /**
   * Create a stake for a challenge
   */
  async createStake(starId, stakeAmountHBAR) {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for transactions");
      }

      console.log(`Creating stake for star ${starId} with ${stakeAmountHBAR} HBAR...`);
      
      // Validate star exists and is active
      const star = await this.getStar(starId);
      if (!star.active) {
        throw new Error(`Star ${starId} is not active`);
      }

      // Validate stake amount
      const info = await this.getContractInfo();
      const stakeAmount = parseFloat(stakeAmountHBAR);
      const minStake = parseFloat(info.minimumStake);
      const maxStake = parseFloat(info.maximumStake);

      if (stakeAmount < minStake || stakeAmount > maxStake) {
        throw new Error(`Stake must be between ${minStake} and ${maxStake} HBAR`);
      }

      // Create transaction
      const stakeWei = ethers.parseEther(stakeAmountHBAR.toString());
      const tx = await this.contracts.core.createStake(starId, { value: stakeWei });
      const receipt = await tx.wait();
      
      console.log(`✅ Stake created! Tx: ${tx.hash}`);
      return { success: true, transaction: tx, receipt };
    } catch (error) {
      console.error(`❌ Failed to create stake: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete a challenge
   */
  async completeChallenge(challengeId, success, aiProof = "") {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for transactions");
      }

      console.log(`Completing challenge ${challengeId}...`);
      
      const tx = await this.contracts.core.completeChallenge(challengeId, success, aiProof);
      const receipt = await tx.wait();
      
      console.log(`✅ Challenge completed! Tx: ${tx.hash}`);
      return { success: true, transaction: tx, receipt };
    } catch (error) {
      console.error(`❌ Failed to complete challenge: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Withdraw winnings
   */
  async withdrawWinnings() {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for transactions");
      }

      console.log("Withdrawing winnings...");
      
      const tx = await this.contracts.core.withdrawWinnings();
      const receipt = await tx.wait();
      
      console.log(`✅ Winnings withdrawn! Tx: ${tx.hash}`);
      return { success: true, transaction: tx, receipt };
    } catch (error) {
      console.error(`❌ Failed to withdraw winnings: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ========== ADMIN FUNCTIONS ==========

  /**
   * Add a new star (owner only)
   */
  async addStar(starId, latitude, longitude, radius, starType) {
    try {
      if (!this.wallet) {
        throw new Error("Wallet required for transactions");
      }

      console.log(`Adding star ${starId} at (${latitude}, ${longitude})...`);
      
      const tx = await this.contracts.core.addStar(starId, latitude, longitude, radius, starType);
      const receipt = await tx.wait();
      
      console.log(`✅ Star added! Tx: ${tx.hash}`);
      return { success: true, transaction: tx, receipt };
    } catch (error) {
      console.error(`❌ Failed to add star: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ========== EVENT MANAGEMENT ==========

  /**
   * Start listening to contract events
   */
  startEventListening(options = {}) {
    const { onStaked, onChallengeCompleted, onStarAdded, onAll } = options;
    
    console.log("🎧 Starting event listeners...");

    if (onStaked || onAll) {
      this.contracts.core.on("Staked", (player, amount, challengeId, event) => {
        const eventData = {
          type: 'Staked',
          player,
          amount: ethers.formatEther(amount),
          challengeId: challengeId.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        if (onStaked) onStaked(eventData);
        if (onAll) onAll(eventData);
      });
    }

    if (onChallengeCompleted || onAll) {
      this.contracts.core.on("ChallengeCompleted", (challengeId, player, success, payout, event) => {
        const eventData = {
          type: 'ChallengeCompleted',
          challengeId: challengeId.toString(),
          player,
          success,
          payout: ethers.formatEther(payout),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        if (onChallengeCompleted) onChallengeCompleted(eventData);
        if (onAll) onAll(eventData);
      });
    }

    if (onStarAdded || onAll) {
      this.contracts.core.on("StarAdded", (starId, latitude, longitude, starType, event) => {
        const eventData = {
          type: 'StarAdded',
          starId: starId.toString(),
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          starType: this.getStarTypeName(starType),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        };
        
        if (onStarAdded) onStarAdded(eventData);
        if (onAll) onAll(eventData);
      });
    }

    console.log("✅ Event listeners started!");
  }

  /**
   * Stop all event listeners
   */
  stopEventListening() {
    this.contracts.core.removeAllListeners();
    console.log("🛑 Event listeners stopped!");
  }

  // ========== BULK OPERATIONS ==========

  /**
   * Get multiple stars at once
   */
  async getMultipleStars(starIds) {
    try {
      const promises = starIds.map(id => this.getStar(id));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        starId: starIds[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      throw new Error(`Failed to get multiple stars: ${error.message}`);
    }
  }

  /**
   * Get all active stars (scans first 100 slots)
   */
  async getAllActiveStars(maxStars = 100) {
    const activeStars = [];
    
    for (let i = 0; i < maxStars; i++) {
      try {
        const star = await this.getStar(i);
        if (star && star.active) {
          activeStars.push({ ...star, starId: i });
        }
      } catch (error) {
        // Star doesn't exist or error reading, continue
      }
    }
    
    return activeStars;
  }

  /**
   * Get game overview
   */
  async getGameOverview() {
    try {
      const [contractInfo, activeStars] = await Promise.all([
        this.getContractInfo(),
        this.getAllActiveStars()
      ]);

      return {
        contractInfo,
        stars: {
          active: activeStars.length,
          details: activeStars
        },
        network: {
          name: this.networkConfig.name,
          explorer: this.networkConfig.explorer
        },
        contracts: STARQUEST_CONTRACTS
      };
    } catch (error) {
      throw new Error(`Failed to get game overview: ${error.message}`);
    }
  }
}

export default StarQuestClient;