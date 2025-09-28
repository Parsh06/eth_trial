"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post('/wallet-login', async (req, res) => {
    try {
        console.log('🔐 Wallet login attempt:', {
            walletAddress: req.body.walletAddress,
            hasSignature: !!req.body.signature,
            hasMessage: !!req.body.message,
            timestamp: new Date().toISOString()
        });
        const { walletAddress, signature, message } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        if (signature && message) {
            try {
                const web3Service = req.app.locals.web3Service;
                const isValidSignature = await web3Service.verifySignature(message, signature, walletAddress);
                if (!isValidSignature) {
                    return res.status(401).json({ error: 'Invalid signature' });
                }
            }
            catch (signatureError) {
                console.warn('Signature verification failed, but allowing for demo:', signatureError?.message || 'Unknown error');
            }
        }
        let user = await User_1.User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user) {
            user = new User_1.User({
                walletAddress: walletAddress.toLowerCase(),
                username: `Explorer_${Math.random().toString(36).substr(2, 9)}`,
                level: 1,
                experience: 0,
                starsCollected: 0,
                nftsOwned: [],
                achievements: [],
                stats: {
                    totalQuests: 0,
                    completedQuests: 0,
                    totalStars: 0,
                    streak: 0,
                    lastActive: new Date()
                },
                preferences: {
                    notifications: true,
                    privacy: 'public',
                    theme: 'auto'
                }
            });
            await user.save();
        }
        else {
            user.stats.lastActive = new Date();
            await user.save();
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            walletAddress: user.walletAddress
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                username: user.username,
                level: user.level,
                experience: user.experience,
                starsCollected: user.starsCollected,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.userId)
            .select('-__v')
            .populate('nftsOwned', 'name imageUrl rarity')
            .lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level,
                experience: user.experience,
                starsCollected: user.starsCollected,
                nftsOwned: user.nftsOwned,
                achievements: user.achievements,
                stats: user.stats,
                preferences: user.preferences,
                completionRate: user.completionRate || 0
            }
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { username, email, avatar, preferences } = req.body;
        const updateData = {};
        if (username) {
            const existingUser = await User_1.User.findOne({
                username,
                _id: { $ne: req.user?.userId }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updateData.username = username;
        }
        if (email !== undefined)
            updateData.email = email;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        if (preferences)
            updateData.preferences = { ...preferences };
        const user = await User_1.User.findByIdAndUpdate(req.user?.userId, updateData, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                level: user.level,
                experience: user.experience,
                starsCollected: user.starsCollected,
                preferences: user.preferences
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
exports.default = router;
//# sourceMappingURL=auth.js.map