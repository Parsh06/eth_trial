"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedWalletCollection = seedWalletCollection;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Star_1 = require("../models/Star");
const Quest_1 = require("../models/Quest");
const NFT_1 = require("../models/NFT");
async function seedWalletCollection() {
    try {
        console.log('🌱 Seeding wallet collection data...');
        const sampleWalletAddress = '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4';
        const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
        let testUser = await User_1.User.findOne({ walletAddress: sampleWalletAddress.toLowerCase() });
        if (!testUser) {
            testUser = new User_1.User({
                walletAddress: sampleWalletAddress.toLowerCase(),
                username: 'TestExplorer_NFT',
                level: 5,
                experience: 1250,
                starsCollected: 12,
                starsFound: 15,
                questsCompleted: 8,
                nftsEarned: 12,
                nftsOwned: [],
                achievements: ['First Star', 'Explorer', 'Cosmic Collector', 'Rare Finder'],
                streak: 7,
                stats: {
                    totalQuests: 10,
                    completedQuests: 8,
                    totalStars: 15,
                    streak: 7,
                    lastActive: new Date()
                },
                preferences: {
                    notifications: true,
                    privacy: 'public',
                    theme: 'dark'
                }
            });
            await testUser.save();
        }
        const sampleQuests = [
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                title: 'Cosmic Explorer',
                description: 'Discover stars in the cosmic realm',
                difficulty: 'medium',
                category: 'exploration',
                location: {
                    name: 'Central Park',
                    coordinates: { latitude: 40.785091, longitude: -73.968285 },
                    radius: 1000
                },
                stars: [],
                rewards: { experience: 200, tokens: 100 },
                requirements: { minLevel: 3 },
                status: 'active',
                creator: testUser._id.toString(),
                participants: [testUser._id.toString()],
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                metadata: {
                    tags: ['cosmic', 'exploration'],
                    featured: true,
                    verified: true,
                    rating: 4.5,
                    completionRate: 75
                }
            },
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                title: 'Elemental Hunt',
                description: 'Find rare elemental stars',
                difficulty: 'hard',
                category: 'challenge',
                location: {
                    name: 'Times Square',
                    coordinates: { latitude: 40.758896, longitude: -73.985130 },
                    radius: 500
                },
                stars: [],
                rewards: { experience: 300, tokens: 150 },
                requirements: { minLevel: 5 },
                status: 'active',
                creator: testUser._id.toString(),
                participants: [testUser._id.toString()],
                startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                metadata: {
                    tags: ['elemental', 'rare'],
                    featured: false,
                    verified: true,
                    rating: 4.8,
                    completionRate: 45
                }
            }
        ];
        for (const questData of sampleQuests) {
            const existingQuest = await Quest_1.Quest.findById(questData._id);
            if (!existingQuest) {
                const quest = new Quest_1.Quest(questData);
                await quest.save();
            }
        }
        const sampleStars = [
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                name: 'Alpha Centauri Star',
                description: 'A brilliant cosmic star from the Alpha Centauri system',
                rarity: 'epic',
                type: 'cosmic',
                location: {
                    name: 'Central Park North',
                    coordinates: { latitude: 40.785091, longitude: -73.968285 }
                },
                quest: sampleQuests[0]._id.toString(),
                discoverer: testUser._id.toString(),
                discoverers: [testUser._id.toString()],
                metadata: {
                    arModel: '/models/alpha-star.glb',
                    glowColor: '#6366f1',
                    size: 1.2,
                    rotation: { x: 0, y: 45, z: 0 }
                },
                rewards: { experience: 100, tokens: 50 },
                status: 'discovered',
                discoveredBy: testUser._id.toString(),
                discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                name: 'Fire Elemental',
                description: 'A rare elemental star burning with eternal flames',
                rarity: 'legendary',
                type: 'elemental',
                location: {
                    name: 'Times Square Center',
                    coordinates: { latitude: 40.758896, longitude: -73.985130 }
                },
                quest: sampleQuests[1]._id.toString(),
                discoverer: testUser._id.toString(),
                discoverers: [testUser._id.toString()],
                metadata: {
                    arModel: '/models/fire-star.glb',
                    glowColor: '#f59e0b',
                    size: 1.5,
                    rotation: { x: 15, y: 0, z: 30 }
                },
                rewards: { experience: 250, tokens: 125 },
                status: 'discovered',
                discoveredBy: testUser._id.toString(),
                discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                name: 'Mystic Crystal',
                description: 'A mystical star infused with ancient crystal energy',
                rarity: 'rare',
                type: 'mystical',
                location: {
                    name: 'Brooklyn Bridge',
                    coordinates: { latitude: 40.706001, longitude: -73.996659 }
                },
                quest: sampleQuests[0]._id.toString(),
                discoverer: testUser._id.toString(),
                discoverers: [testUser._id.toString()],
                metadata: {
                    arModel: '/models/crystal-star.glb',
                    glowColor: '#8b5cf6',
                    size: 1.0,
                    rotation: { x: 0, y: 90, z: 0 }
                },
                rewards: { experience: 75, tokens: 35 },
                status: 'discovered',
                discoveredBy: testUser._id.toString(),
                discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];
        for (const starData of sampleStars) {
            const existingStar = await Star_1.Star.findById(starData._id);
            if (!existingStar) {
                const star = new Star_1.Star(starData);
                await star.save();
            }
        }
        const sampleNFTs = [
            {
                tokenId: '1001',
                contractAddress: contractAddress.toLowerCase(),
                name: 'Alpha Centauri Star NFT',
                description: 'A brilliant cosmic star from the Alpha Centauri system - your first legendary discovery',
                image: 'https://starquest-assets.s3.amazonaws.com/nfts/alpha-centauri.png',
                imageUrl: 'https://starquest-assets.s3.amazonaws.com/nfts/alpha-centauri.png',
                animationUrl: 'https://starquest-assets.s3.amazonaws.com/animations/alpha-centauri.mp4',
                rarity: 'epic',
                starType: 'cosmic',
                attributes: [
                    { trait_type: 'Rarity', value: 'Epic' },
                    { trait_type: 'Type', value: 'Cosmic' },
                    { trait_type: 'Discovery Date', value: '2024-09-22' },
                    { trait_type: 'Power Level', value: 85, display_type: 'number', max_value: 100 },
                    { trait_type: 'Glow Intensity', value: 'High' }
                ],
                metadata: {
                    background_color: '1a1b3e',
                    properties: {
                        constellation: 'Alpha Centauri',
                        energy_type: 'Cosmic',
                        discovery_method: 'AR_Scanner'
                    },
                    stats: {
                        power: 85,
                        rarity_score: 8.5,
                        collection_value: 250
                    }
                },
                owner: sampleWalletAddress.toLowerCase(),
                discoverer: sampleWalletAddress.toLowerCase(),
                discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                claimedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                starId: sampleStars[0]._id.toString(),
                questId: sampleQuests[0]._id.toString(),
                blockchain: {
                    network: 'polygon',
                    contractAddress: contractAddress.toLowerCase(),
                    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
                },
                stats: { views: 15, likes: 8, transfers: 0 },
                status: 'minted'
            },
            {
                tokenId: '1002',
                contractAddress: contractAddress.toLowerCase(),
                name: 'Fire Elemental NFT',
                description: 'A rare elemental star burning with eternal flames - extremely powerful and sought after',
                image: 'https://starquest-assets.s3.amazonaws.com/nfts/fire-elemental.png',
                imageUrl: 'https://starquest-assets.s3.amazonaws.com/nfts/fire-elemental.png',
                animationUrl: 'https://starquest-assets.s3.amazonaws.com/animations/fire-elemental.mp4',
                rarity: 'legendary',
                starType: 'elemental',
                attributes: [
                    { trait_type: 'Rarity', value: 'Legendary' },
                    { trait_type: 'Type', value: 'Elemental' },
                    { trait_type: 'Element', value: 'Fire' },
                    { trait_type: 'Discovery Date', value: '2024-09-25' },
                    { trait_type: 'Power Level', value: 98, display_type: 'number', max_value: 100 },
                    { trait_type: 'Temperature', value: '3000°C' }
                ],
                metadata: {
                    background_color: 'ff4500',
                    properties: {
                        element: 'Fire',
                        temperature: 3000,
                        flame_type: 'Eternal',
                        discovery_method: 'AR_Scanner'
                    },
                    stats: {
                        power: 98,
                        rarity_score: 9.8,
                        collection_value: 500
                    }
                },
                owner: sampleWalletAddress.toLowerCase(),
                discoverer: sampleWalletAddress.toLowerCase(),
                discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                starId: sampleStars[1]._id.toString(),
                questId: sampleQuests[1]._id.toString(),
                blockchain: {
                    network: 'polygon',
                    contractAddress: contractAddress.toLowerCase(),
                    transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
                },
                stats: { views: 32, likes: 24, transfers: 1 },
                status: 'minted'
            },
            {
                tokenId: '1003',
                contractAddress: contractAddress.toLowerCase(),
                name: 'Mystic Crystal NFT',
                description: 'A mystical star infused with ancient crystal energy - holds secrets of the past',
                image: 'https://starquest-assets.s3.amazonaws.com/nfts/mystic-crystal.png',
                imageUrl: 'https://starquest-assets.s3.amazonaws.com/nfts/mystic-crystal.png',
                rarity: 'rare',
                starType: 'mystical',
                attributes: [
                    { trait_type: 'Rarity', value: 'Rare' },
                    { trait_type: 'Type', value: 'Mystical' },
                    { trait_type: 'Crystal Type', value: 'Amethyst' },
                    { trait_type: 'Discovery Date', value: '2024-09-26' },
                    { trait_type: 'Power Level', value: 65, display_type: 'number', max_value: 100 },
                    { trait_type: 'Mystical Energy', value: 'Ancient' }
                ],
                metadata: {
                    background_color: '8b5cf6',
                    properties: {
                        crystal_type: 'Amethyst',
                        age: 'Ancient',
                        mystical_power: 'Divination',
                        discovery_method: 'AR_Scanner'
                    },
                    stats: {
                        power: 65,
                        rarity_score: 6.5,
                        collection_value: 100
                    }
                },
                owner: sampleWalletAddress.toLowerCase(),
                discoverer: sampleWalletAddress.toLowerCase(),
                discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                claimedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                starId: sampleStars[2]._id.toString(),
                questId: sampleQuests[0]._id.toString(),
                blockchain: {
                    network: 'polygon',
                    contractAddress: contractAddress.toLowerCase(),
                    transactionHash: '0x1357924680abcdef1357924680abcdef1357924680abcdef1357924680abcdef'
                },
                stats: { views: 8, likes: 5, transfers: 0 },
                status: 'minted'
            }
        ];
        const nftIds = [];
        for (const nftData of sampleNFTs) {
            const existingNFT = await NFT_1.NFT.findOne({
                contractAddress: nftData.contractAddress,
                tokenId: nftData.tokenId
            });
            if (!existingNFT) {
                const nft = new NFT_1.NFT(nftData);
                await nft.save();
                nftIds.push(nft._id.toString());
            }
            else {
                nftIds.push(existingNFT._id.toString());
            }
        }
        await User_1.User.updateOne({ _id: testUser._id }, {
            $set: {
                nftsOwned: nftIds,
                nftsEarned: nftIds.length
            }
        });
        console.log('✅ Wallet collection data seeded successfully!');
        console.log(`📊 Created/Updated:`);
        console.log(`   - User: ${testUser.username} (${testUser.walletAddress})`);
        console.log(`   - Quests: ${sampleQuests.length}`);
        console.log(`   - Stars: ${sampleStars.length}`);
        console.log(`   - NFTs: ${sampleNFTs.length}`);
        return {
            user: testUser,
            walletAddress: sampleWalletAddress,
            contractAddress,
            nftCount: nftIds.length
        };
    }
    catch (error) {
        console.error('❌ Error seeding wallet collection data:', error);
        throw error;
    }
}
if (require.main === module) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starquest';
    mongoose_1.default.connect(MONGODB_URI)
        .then(async () => {
        console.log('Connected to MongoDB');
        await seedWalletCollection();
        process.exit(0);
    })
        .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=wallet-collection-seeder.js.map