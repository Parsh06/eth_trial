"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const NFT_1 = require("../models/NFT");
const User_1 = require("../models/User");
class WalletService {
    constructor(web3Service) {
        this.web3Service = web3Service;
    }
    async getUserNFTs(walletAddress, options = {}) {
        try {
            const { limit = 20, offset = 0, sortBy = 'discoveredAt', sortOrder = 'desc', rarity, starType, status } = options;
            const query = { owner: walletAddress.toLowerCase() };
            if (rarity)
                query.rarity = rarity;
            if (starType)
                query.starType = starType;
            if (status)
                query.status = status;
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            const [nfts, total, rarityStats, typeStats] = await Promise.all([
                NFT_1.NFT.find(query)
                    .populate('starId', 'name location rewards')
                    .populate('questId', 'title difficulty category')
                    .sort(sort)
                    .skip(offset)
                    .limit(limit)
                    .lean(),
                NFT_1.NFT.countDocuments(query),
                NFT_1.NFT.aggregate([
                    { $match: { owner: walletAddress.toLowerCase() } },
                    { $group: { _id: '$rarity', count: { $sum: 1 } } }
                ]),
                NFT_1.NFT.aggregate([
                    { $match: { owner: walletAddress.toLowerCase() } },
                    { $group: { _id: '$starType', count: { $sum: 1 } } }
                ])
            ]);
            const rarityBreakdown = {};
            const typeBreakdown = {};
            rarityStats.forEach((stat) => {
                rarityBreakdown[stat._id] = stat.count;
            });
            typeStats.forEach((stat) => {
                typeBreakdown[stat._id] = stat.count;
            });
            const rarityValues = {
                common: 10,
                uncommon: 25,
                rare: 50,
                epic: 100,
                legendary: 250
            };
            const totalValue = nfts.reduce((sum, nft) => {
                return sum + (rarityValues[nft.rarity] || 0);
            }, 0);
            return {
                nfts: nfts,
                total,
                hasMore: offset + limit < total,
                statistics: {
                    totalNFTs: total,
                    rarityBreakdown,
                    typeBreakdown,
                    totalValue
                }
            };
        }
        catch (error) {
            console.error('Error fetching user NFTs:', error);
            throw new Error('Failed to fetch user NFT collection');
        }
    }
    async getNFTDetails(contractAddress, tokenId) {
        try {
            const nft = await NFT_1.NFT.findOne({
                contractAddress: contractAddress.toLowerCase(),
                tokenId
            })
                .populate('starId', 'name description location rewards metadata')
                .populate('questId', 'title description difficulty category location')
                .populate('discoverer', 'username avatar level', 'User');
            if (nft) {
                await nft.incrementViews();
            }
            return nft;
        }
        catch (error) {
            console.error('Error fetching NFT details:', error);
            throw new Error('Failed to fetch NFT details');
        }
    }
    async getWalletSummary(walletAddress) {
        try {
            const [totalNFTs, rarityDistribution, typeDistribution, topNFTs, user] = await Promise.all([
                NFT_1.NFT.countDocuments({ owner: walletAddress.toLowerCase() }),
                NFT_1.NFT.aggregate([
                    { $match: { owner: walletAddress.toLowerCase() } },
                    { $group: { _id: '$rarity', count: { $sum: 1 } } }
                ]),
                NFT_1.NFT.aggregate([
                    { $match: { owner: walletAddress.toLowerCase() } },
                    { $group: { _id: '$starType', count: { $sum: 1 } } }
                ]),
                NFT_1.NFT.find({ owner: walletAddress.toLowerCase() })
                    .sort({ rarity: -1, discoveredAt: -1 })
                    .limit(5)
                    .populate('starId', 'name rewards')
                    .lean(),
                User_1.User.findOne({ walletAddress: walletAddress.toLowerCase() })
            ]);
            const rarityValues = {
                common: 10,
                uncommon: 25,
                rare: 50,
                epic: 100,
                legendary: 250
            };
            const rarityBreakdown = {};
            const typeBreakdown = {};
            let totalValue = 0;
            rarityDistribution.forEach((item) => {
                rarityBreakdown[item._id] = item.count;
                totalValue += item.count * (rarityValues[item._id] || 0);
            });
            typeDistribution.forEach((item) => {
                typeBreakdown[item._id] = item.count;
            });
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
                topNFTs: topNFTs,
                achievements: user?.achievements || []
            };
        }
        catch (error) {
            console.error('Error fetching wallet summary:', error);
            throw new Error('Failed to fetch wallet summary');
        }
    }
    async getWalletInfo(walletAddress) {
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
        }
        catch (error) {
            console.error('Error fetching wallet info:', error);
            return {
                balance: '0',
                network: null,
                transactionCount: 0,
                isConnected: false
            };
        }
    }
    async createNFT(starData) {
        try {
            const nft = new NFT_1.NFT({
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
            await User_1.User.updateOne({ walletAddress: starData.owner.toLowerCase() }, {
                $inc: { nftsEarned: 1, nftsOwned: 1 },
                $push: { nftsOwned: nft._id }
            });
            return nft;
        }
        catch (error) {
            console.error('Error creating NFT:', error);
            throw new Error('Failed to create NFT');
        }
    }
    async transferNFT(contractAddress, tokenId, fromAddress, toAddress, transactionHash) {
        try {
            const nft = await NFT_1.NFT.findOne({
                contractAddress: contractAddress.toLowerCase(),
                tokenId,
                owner: fromAddress.toLowerCase()
            });
            if (!nft) {
                throw new Error('NFT not found or not owned by sender');
            }
            await nft.transfer(toAddress, transactionHash);
            await Promise.all([
                User_1.User.updateOne({ walletAddress: fromAddress.toLowerCase() }, {
                    $inc: { nftsOwned: -1 },
                    $pull: { nftsOwned: nft._id }
                }),
                User_1.User.updateOne({ walletAddress: toAddress.toLowerCase() }, {
                    $inc: { nftsOwned: 1 },
                    $push: { nftsOwned: nft._id }
                })
            ]);
            return nft;
        }
        catch (error) {
            console.error('Error transferring NFT:', error);
            throw new Error('Failed to transfer NFT');
        }
    }
    async getNFTMetadata(contractAddress, tokenId) {
        try {
            const nft = await NFT_1.NFT.findOne({
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
        }
        catch (error) {
            console.error('Error fetching NFT metadata:', error);
            throw new Error('Failed to fetch NFT metadata');
        }
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=WalletService.js.map