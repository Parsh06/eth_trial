import { Web3Service } from './Web3Service';
import { NFT, INFT } from '../models/NFT';
import { User } from '../models/User';
import { Star } from '../models/Star';

export class WalletService {
  private web3Service: Web3Service;

  constructor(web3Service: Web3Service) {
    this.web3Service = web3Service;
  }

  // Get user's NFT collection
  async getUserNFTs(walletAddress: string, options: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    rarity?: string;
    starType?: string;
    status?: string;
  } = {}): Promise<{
    nfts: INFT[];
    total: number;
    hasMore: boolean;
    statistics: {
      totalNFTs: number;
      rarityBreakdown: Record<string, number>;
      typeBreakdown: Record<string, number>;
      totalValue: number;
    };
  }> {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'discoveredAt',
        sortOrder = 'desc',
        rarity,
        starType,
        status
      } = options;

      // Build query filters
      const query: any = { owner: walletAddress.toLowerCase() };
      
      if (rarity) query.rarity = rarity;
      if (starType) query.starType = starType;
      if (status) query.status = status;

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute queries
      const [nfts, total, rarityStats, typeStats] = await Promise.all([
        NFT.find(query)
          .populate('starId', 'name location rewards')
          .populate('questId', 'title difficulty category')
          .sort(sort)
          .skip(offset)
          .limit(limit)
          .lean(),
        NFT.countDocuments(query),
        NFT.aggregate([
          { $match: { owner: walletAddress.toLowerCase() } },
          { $group: { _id: '$rarity', count: { $sum: 1 } } }
        ]),
        NFT.aggregate([
          { $match: { owner: walletAddress.toLowerCase() } },
          { $group: { _id: '$starType', count: { $sum: 1 } } }
        ])
      ]);

      // Process statistics
      const rarityBreakdown: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};

      rarityStats.forEach((stat: any) => {
        rarityBreakdown[stat._id] = stat.count;
      });

      typeStats.forEach((stat: any) => {
        typeBreakdown[stat._id] = stat.count;
      });

      // Calculate estimated total value (simplified)
      const rarityValues = {
        common: 10,
        uncommon: 25,
        rare: 50,
        epic: 100,
        legendary: 250
      };

      const totalValue = nfts.reduce((sum: number, nft: any) => {
        return sum + (rarityValues[nft.rarity as keyof typeof rarityValues] || 0);
      }, 0);

      return {
        nfts: nfts as INFT[],
        total,
        hasMore: offset + limit < total,
        statistics: {
          totalNFTs: total,
          rarityBreakdown,
          typeBreakdown,
          totalValue
        }
      };

    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      throw new Error('Failed to fetch user NFT collection');
    }
  }

  // Get detailed NFT information
  async getNFTDetails(contractAddress: string, tokenId: string): Promise<INFT | null> {
    try {
      const nft = await NFT.findOne({
        contractAddress: contractAddress.toLowerCase(),
        tokenId
      })
      .populate('starId', 'name description location rewards metadata')
      .populate('questId', 'title description difficulty category location')
      .populate('discoverer', 'username avatar level', 'User');

      if (nft) {
        // Increment view count
        await nft.incrementViews();
      }

      return nft;
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      throw new Error('Failed to fetch NFT details');
    }
  }

  // Get wallet summary/overview
  async getWalletSummary(walletAddress: string): Promise<{
    totalNFTs: number;
    totalValue: number;
    rarityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
    recentActivity: Array<{
      type: string;
      nftId: string;
      timestamp: Date;
      details: any;
    }>;
    topNFTs: INFT[];
    achievements: string[];
  }> {
    try {
      const [
        totalNFTs,
        rarityDistribution,
        typeDistribution,
        topNFTs,
        user
      ] = await Promise.all([
        NFT.countDocuments({ owner: walletAddress.toLowerCase() }),
        NFT.aggregate([
          { $match: { owner: walletAddress.toLowerCase() } },
          { $group: { _id: '$rarity', count: { $sum: 1 } } }
        ]),
        NFT.aggregate([
          { $match: { owner: walletAddress.toLowerCase() } },
          { $group: { _id: '$starType', count: { $sum: 1 } } }
        ]),
        NFT.find({ owner: walletAddress.toLowerCase() })
          .sort({ rarity: -1, discoveredAt: -1 })
          .limit(5)
          .populate('starId', 'name rewards')
          .lean(),
        User.findOne({ walletAddress: walletAddress.toLowerCase() })
      ]);

      // Calculate total estimated value
      const rarityValues = {
        common: 10,
        uncommon: 25,
        rare: 50,
        epic: 100,
        legendary: 250
      };

      const rarityBreakdown: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};
      let totalValue = 0;

      rarityDistribution.forEach((item: any) => {
        rarityBreakdown[item._id] = item.count;
        totalValue += item.count * (rarityValues[item._id as keyof typeof rarityValues] || 0);
      });

      typeDistribution.forEach((item: any) => {
        typeBreakdown[item._id] = item.count;
      });

      // Mock recent activity (in a real app, this would come from an activity log)
      const recentActivity = [
        {
          type: 'nft_discovered',
          nftId: topNFTs[0]?._id?.toString() || '',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          details: { starName: topNFTs[0]?.name || 'Unknown Star' }
        },
        {
          type: 'nft_claimed',
          nftId: topNFTs[1]?._id?.toString() || '',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          details: { rewards: '100 SQT' }
        }
      ];

      return {
        totalNFTs,
        totalValue,
        rarityDistribution: rarityBreakdown,
        typeDistribution: typeBreakdown,
        recentActivity,
        topNFTs: topNFTs as INFT[],
        achievements: user?.achievements || []
      };

    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      throw new Error('Failed to fetch wallet summary');
    }
  }

  // Get wallet balance and blockchain info
  async getWalletInfo(walletAddress: string): Promise<{
    balance: string;
    network: any;
    transactionCount: number;
    isConnected: boolean;
  }> {
    try {
      if (!this.web3Service.isConnected()) {
        return {
          balance: '0',
          network: null,
          transactionCount: 0,
          isConnected: false
        };
      }

      const [balance, transactionCount, network] = await Promise.all([
        this.web3Service.getBalance(walletAddress).catch(() => '0'),
        this.web3Service.getTransactionCount(walletAddress).catch(() => 0),
        this.web3Service.getNetworkInfo().catch(() => null)
      ]);

      return {
        balance,
        network,
        transactionCount,
        isConnected: true
      };

    } catch (error) {
      console.error('Error fetching wallet info:', error);
      return {
        balance: '0',
        network: null,
        transactionCount: 0,
        isConnected: false
      };
    }
  }

  // Create/mint a new NFT when a star is claimed
  async createNFT(starData: {
    starId: string;
    tokenId: string;
    contractAddress: string;
    owner: string;
    discoverer: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: string;
    starType: string;
    attributes: Array<any>;
    questId?: string;
    transactionHash?: string;
  }): Promise<INFT> {
    try {
      const nft = new NFT({
        tokenId: starData.tokenId,
        contractAddress: starData.contractAddress.toLowerCase(),
        name: starData.name,
        description: starData.description,
        image: starData.imageUrl,
        imageUrl: starData.imageUrl,
        rarity: starData.rarity,
        starType: starData.starType,
        attributes: starData.attributes,
        owner: starData.owner.toLowerCase(),
        discoverer: starData.discoverer.toLowerCase(),
        discoveredAt: new Date(),
        claimedAt: new Date(),
        starId: starData.starId,
        questId: starData.questId,
        blockchain: {
          network: 'polygon',
          contractAddress: starData.contractAddress.toLowerCase(),
          transactionHash: starData.transactionHash
        },
        stats: {
          views: 0,
          likes: 0,
          transfers: 0
        },
        status: 'minted'
      });

      await nft.save();

      // Update user's NFT count
      await User.updateOne(
        { walletAddress: starData.owner.toLowerCase() },
        { 
          $inc: { nftsEarned: 1, nftsOwned: 1 },
          $push: { nftsOwned: nft._id }
        }
      );

      return nft;

    } catch (error) {
      console.error('Error creating NFT:', error);
      throw new Error('Failed to create NFT');
    }
  }

  // Transfer NFT to another wallet
  async transferNFT(contractAddress: string, tokenId: string, fromAddress: string, toAddress: string, transactionHash?: string): Promise<INFT> {
    try {
      const nft = await NFT.findOne({
        contractAddress: contractAddress.toLowerCase(),
        tokenId,
        owner: fromAddress.toLowerCase()
      });

      if (!nft) {
        throw new Error('NFT not found or not owned by sender');
      }

      // Update NFT ownership
      await nft.transfer(toAddress, transactionHash);

      // Update user stats
      await Promise.all([
        User.updateOne(
          { walletAddress: fromAddress.toLowerCase() },
          { 
            $inc: { nftsOwned: -1 },
            $pull: { nftsOwned: nft._id }
          }
        ),
        User.updateOne(
          { walletAddress: toAddress.toLowerCase() },
          { 
            $inc: { nftsOwned: 1 },
            $push: { nftsOwned: nft._id }
          }
        )
      ]);

      return nft;

    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw new Error('Failed to transfer NFT');
    }
  }

  // Get NFT metadata (for OpenSea compatibility)
  async getNFTMetadata(contractAddress: string, tokenId: string): Promise<any> {
    try {
      const nft = await NFT.findOne({
        contractAddress: contractAddress.toLowerCase(),
        tokenId
      }).populate('starId');

      if (!nft) {
        throw new Error('NFT not found');
      }

      return {
        name: nft.name,
        description: nft.description,
        image: nft.imageUrl,
        external_url: nft.externalUrl,
        animation_url: nft.animationUrl,
        background_color: nft.metadata.background_color,
        attributes: nft.attributes,
        properties: {
          rarity: nft.rarity,
          star_type: nft.starType,
          discoverer: nft.discoverer,
          discovered_at: nft.discoveredAt,
          quest_id: nft.questId,
          ...nft.metadata.properties
        },
        stats: nft.metadata.stats
      };

    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      throw new Error('Failed to fetch NFT metadata');
    }
  }
}
