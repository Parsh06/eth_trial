"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const WalletService_1 = require("../services/WalletService");
const router = express_1.default.Router();
let walletService;
let web3Service;
router.use((req, res, next) => {
    web3Service = req.app.locals.web3Service;
    if (!walletService) {
        walletService = new WalletService_1.WalletService(web3Service);
    }
    next();
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    });
}
router.get('/collection', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const { limit = '20', offset = '0', sortBy = 'discoveredAt', sortOrder = 'desc', rarity, starType, status } = req.query;
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            sortBy: sortBy,
            sortOrder: sortOrder,
            rarity: rarity,
            starType: starType,
            status: status
        };
        const collection = await walletService.getUserNFTs(walletAddress, options);
        res.json({
            success: true,
            data: collection
        });
    }
    catch (error) {
        console.error('Get collection error:', error);
        res.status(500).json({
            error: 'Failed to fetch NFT collection',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const summary = await walletService.getWalletSummary(walletAddress);
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error('Get wallet summary error:', error);
        res.status(500).json({
            error: 'Failed to fetch wallet summary',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/info', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const walletInfo = await walletService.getWalletInfo(walletAddress);
        res.json({
            success: true,
            data: walletInfo
        });
    }
    catch (error) {
        console.error('Get wallet info error:', error);
        res.status(500).json({
            error: 'Failed to fetch wallet info',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/nft/:contractAddress/:tokenId', authenticateToken, async (req, res) => {
    try {
        const { contractAddress, tokenId } = req.params;
        const nft = await walletService.getNFTDetails(contractAddress, tokenId);
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found' });
        }
        res.json({
            success: true,
            data: nft
        });
    }
    catch (error) {
        console.error('Get NFT details error:', error);
        res.status(500).json({
            error: 'Failed to fetch NFT details',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/nft/:contractAddress/:tokenId/metadata', async (req, res) => {
    try {
        const { contractAddress, tokenId } = req.params;
        const metadata = await walletService.getNFTMetadata(contractAddress, tokenId);
        res.json(metadata);
    }
    catch (error) {
        console.error('Get NFT metadata error:', error);
        res.status(404).json({
            error: 'NFT not found',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/nft/:contractAddress/:tokenId/like', authenticateToken, async (req, res) => {
    try {
        const { contractAddress, tokenId } = req.params;
        const nft = await walletService.getNFTDetails(contractAddress, tokenId);
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found' });
        }
        await nft.incrementLikes();
        res.json({
            success: true,
            data: {
                likes: nft.stats.likes
            }
        });
    }
    catch (error) {
        console.error('Like NFT error:', error);
        res.status(500).json({
            error: 'Failed to like NFT',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/nft/mint', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const { starId, tokenId, contractAddress, name, description, imageUrl, rarity, starType, attributes, questId, transactionHash } = req.body;
        if (!starId || !tokenId || !contractAddress || !name || !description || !imageUrl || !rarity || !starType) {
            return res.status(400).json({ error: 'Missing required fields for NFT minting' });
        }
        const nft = await walletService.createNFT({
            starId,
            tokenId,
            contractAddress,
            owner: walletAddress,
            discoverer: walletAddress,
            name,
            description,
            imageUrl,
            rarity,
            starType,
            attributes: attributes || [],
            questId,
            transactionHash
        });
        res.json({
            success: true,
            data: nft
        });
    }
    catch (error) {
        console.error('Mint NFT error:', error);
        res.status(500).json({
            error: 'Failed to mint NFT',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/nft/:contractAddress/:tokenId/transfer', authenticateToken, async (req, res) => {
    try {
        const { contractAddress, tokenId } = req.params;
        const { toAddress, transactionHash } = req.body;
        const fromAddress = req.user?.walletAddress;
        if (!fromAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        if (!toAddress) {
            return res.status(400).json({ error: 'Destination address required' });
        }
        const nft = await walletService.transferNFT(contractAddress, tokenId, fromAddress, toAddress, transactionHash);
        res.json({
            success: true,
            data: nft
        });
    }
    catch (error) {
        console.error('Transfer NFT error:', error);
        res.status(500).json({
            error: 'Failed to transfer NFT',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const [summary, walletInfo] = await Promise.all([
            walletService.getWalletSummary(walletAddress),
            walletService.getWalletInfo(walletAddress)
        ]);
        const stats = {
            ...summary,
            blockchain: {
                balance: walletInfo.balance,
                network: walletInfo.network,
                transactionCount: walletInfo.transactionCount,
                isConnected: walletInfo.isConnected
            }
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get wallet stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch wallet statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/activity', authenticateToken, async (req, res) => {
    try {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address not found' });
        }
        const { limit = '10', offset = '0' } = req.query;
        const summary = await walletService.getWalletSummary(walletAddress);
        res.json({
            success: true,
            data: {
                activities: summary.recentActivity.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
                total: summary.recentActivity.length,
                hasMore: parseInt(offset) + parseInt(limit) < summary.recentActivity.length
            }
        });
    }
    catch (error) {
        console.error('Get wallet activity error:', error);
        res.status(500).json({
            error: 'Failed to fetch wallet activity',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=wallet.js.map