"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Star_1 = require("../models/Star");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { status, difficulty, limit = 50, offset = 0 } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }
        const stars = await Star_1.Star.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({ createdAt: -1 });
        const total = await Star_1.Star.countDocuments(query);
        res.status(200).json({
            stars,
            total,
            hasMore: Number(offset) + Number(limit) < total,
        });
    }
    catch (error) {
        console.error('Error getting stars:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get('/:starId', async (req, res) => {
    try {
        const { starId } = req.params;
        const star = await Star_1.Star.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }
        res.status(200).json(star);
    }
    catch (error) {
        console.error('Error getting star:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.post('/', async (req, res) => {
    try {
        const starData = req.body;
        const newStar = new Star_1.Star(starData);
        await newStar.save();
        res.status(201).json(newStar);
    }
    catch (error) {
        console.error('Error creating star:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.put('/:starId', async (req, res) => {
    try {
        const { starId } = req.params;
        const updates = req.body;
        const star = await Star_1.Star.findByIdAndUpdate(starId, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }
        res.status(200).json(star);
    }
    catch (error) {
        console.error('Error updating star:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.post('/:starId/discover', async (req, res) => {
    try {
        const { starId } = req.params;
        const { userId, position } = req.body;
        const star = await Star_1.Star.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }
        if (star.status !== 'available') {
            return res.status(400).json({ message: 'Star is not available for discovery' });
        }
        star.status = 'completed';
        star.discoveredBy = userId;
        star.discoveredAt = new Date();
        star.discoveryPosition = position;
        await star.save();
        res.status(200).json({
            message: 'Star discovered successfully',
            star,
            reward: star.rewards,
        });
    }
    catch (error) {
        console.error('Error discovering star:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 50, offset = 0 } = req.query;
        let query = { discoveredBy: userId };
        if (status) {
            query.status = status;
        }
        const stars = await Star_1.Star.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({ discoveredAt: -1 });
        const total = await Star_1.Star.countDocuments(query);
        res.status(200).json({
            stars,
            total,
            hasMore: Number(offset) + Number(limit) < total,
        });
    }
    catch (error) {
        console.error('Error getting user stars:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get('/map/position', async (req, res) => {
    try {
        const { lat, lng, radius = 1000 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        const stars = await Star_1.Star.find({
            status: 'available',
            'position.lat': {
                $gte: Number(lat) - (Number(radius) / 111000),
                $lte: Number(lat) + (Number(radius) / 111000),
            },
            'position.lng': {
                $gte: Number(lng) - (Number(radius) / 111000),
                $lte: Number(lng) + (Number(radius) / 111000),
            },
        });
        res.status(200).json(stars);
    }
    catch (error) {
        console.error('Error getting stars by position:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get('/stats/overview', async (req, res) => {
    try {
        const totalStars = await Star_1.Star.countDocuments();
        const availableStars = await Star_1.Star.countDocuments({ status: 'available' });
        const completedStars = await Star_1.Star.countDocuments({ status: 'completed' });
        const lockedStars = await Star_1.Star.countDocuments({ status: 'locked' });
        const difficultyStats = await Star_1.Star.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 },
                },
            },
        ]);
        const rarityStats = await Star_1.Star.aggregate([
            {
                $group: {
                    _id: '$reward.rarity',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json({
            total: totalStars,
            available: availableStars,
            completed: completedStars,
            locked: lockedStars,
            difficulty: difficultyStats,
            rarity: rarityStats,
        });
    }
    catch (error) {
        console.error('Error getting star statistics:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
router.delete('/:starId', async (req, res) => {
    try {
        const { starId } = req.params;
        const star = await Star_1.Star.findByIdAndDelete(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }
        res.status(200).json({ message: 'Star deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting star:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.default = router;
//# sourceMappingURL=star.js.map