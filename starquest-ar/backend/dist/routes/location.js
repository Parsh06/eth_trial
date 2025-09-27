"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Star_1 = require("../models/Star");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/nearby', auth_1.authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude, radius = 1000 } = req.query;
        const userId = req.user.id;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const searchRadius = parseInt(radius);
        const nearbyStars = await Star_1.Star.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: searchRadius
                }
            },
            status: { $in: ['hidden', 'available'] }
        }).populate('quest', 'name description');
        const availableStars = nearbyStars.filter(star => !star.discoverers.includes(userId));
        const starsWithDistance = availableStars.map(star => {
            const distance = calculateDistance(lat, lng, star.location.coordinates.latitude, star.location.coordinates.longitude);
            return {
                ...star.toObject(),
                distance: Math.round(distance),
                isNearby: distance <= 50
            };
        });
        res.json({
            success: true,
            stars: starsWithDistance,
            count: starsWithDistance.length
        });
    }
    catch (error) {
        console.error('Error fetching nearby stars:', error);
        res.status(500).json({ error: 'Failed to fetch nearby stars' });
    }
});
router.post('/discover/:starId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { starId } = req.params;
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Current location is required' });
        }
        const star = await Star_1.Star.findById(starId);
        if (!star) {
            return res.status(404).json({ error: 'Star not found' });
        }
        const distance = calculateDistance(latitude, longitude, star.location.coordinates.latitude, star.location.coordinates.longitude);
        if (distance > 50) {
            return res.status(400).json({
                error: 'You must be within 50 meters to discover this star',
                distance: Math.round(distance)
            });
        }
        if (star.discoverers.includes(userId)) {
            return res.status(400).json({ error: 'You have already discovered this star' });
        }
        await star.discover(userId);
        const user = await User_1.User.findById(userId);
        if (user) {
            user.experience += star.rewards.experience;
            user.starsDiscovered += 1;
            await user.save();
        }
        res.json({
            success: true,
            message: 'Star discovered successfully!',
            star: star,
            rewards: star.rewards,
            distance: Math.round(distance)
        });
    }
    catch (error) {
        console.error('Error discovering star:', error);
        res.status(500).json({ error: 'Failed to discover star' });
    }
});
router.post('/challenge/:starId/start', auth_1.authenticateToken, async (req, res) => {
    try {
        const { starId } = req.params;
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        const star = await Star_1.Star.findById(starId);
        if (!star) {
            return res.status(404).json({ error: 'Star not found' });
        }
        if (!star.discoverers.includes(userId)) {
            return res.status(400).json({ error: 'You must discover the star first' });
        }
        const distance = calculateDistance(latitude, longitude, star.location.coordinates.latitude, star.location.coordinates.longitude);
        if (distance > 10) {
            return res.status(400).json({
                error: 'You must be within 10 meters for AR interaction',
                distance: Math.round(distance)
            });
        }
        const challengeData = {
            starId: star._id,
            userId: userId,
            startTime: new Date(),
            status: 'active',
            arData: star.metadata,
            challengeType: star.quest ? 'quest' : 'collection'
        };
        res.json({
            success: true,
            challenge: challengeData,
            arData: star.metadata,
            star: star
        });
    }
    catch (error) {
        console.error('Error starting AR challenge:', error);
        res.status(500).json({ error: 'Failed to start AR challenge' });
    }
});
router.post('/challenge/:starId/complete', auth_1.authenticateToken, async (req, res) => {
    try {
        const { starId } = req.params;
        const { proof, arInteractionData } = req.body;
        const userId = req.user.id;
        const star = await Star_1.Star.findById(starId);
        if (!star) {
            return res.status(404).json({ error: 'Star not found' });
        }
        const isValidInteraction = await verifyARInteraction(arInteractionData, star);
        if (!isValidInteraction) {
            return res.status(400).json({ error: 'Invalid AR interaction' });
        }
        await star.claim(userId);
        const user = await User_1.User.findById(userId);
        if (user) {
            user.tokens += star.rewards.tokens || 0;
            user.experience += star.rewards.experience;
            await user.save();
        }
        res.json({
            success: true,
            message: 'Challenge completed successfully!',
            rewards: star.rewards,
            star: star
        });
    }
    catch (error) {
        console.error('Error completing AR challenge:', error);
        res.status(500).json({ error: 'Failed to complete AR challenge' });
    }
});
router.get('/discovered', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const discoveredStars = await Star_1.Star.find({
            discoverers: userId
        }).populate('quest', 'name description');
        res.json({
            success: true,
            stars: discoveredStars,
            count: discoveredStars.length
        });
    }
    catch (error) {
        console.error('Error fetching discovered stars:', error);
        res.status(500).json({ error: 'Failed to fetch discovered stars' });
    }
});
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
async function verifyARInteraction(arData, star) {
    return true;
}
exports.default = router;
//# sourceMappingURL=location.js.map