import express from 'express';
import { Star } from '../models/Star';
import { Quest } from '../models/Quest';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get nearby challenges/tokens based on user location
router.get('/nearby', authenticateToken, async (req: any, res) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.query; // radius in meters, default 1km
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const searchRadius = parseInt(radius as string);

    // Find nearby stars using geospatial query
    const nearbyStars = await Star.find({
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

    // Filter out stars already discovered by user
    const availableStars = nearbyStars.filter(star => 
      !star.discoverers.includes(userId)
    );

    // Add distance calculation for each star
    const starsWithDistance = availableStars.map(star => {
      const distance = calculateDistance(
        lat, lng,
        star.location.coordinates.latitude,
        star.location.coordinates.longitude
      );

      return {
        ...star.toObject(),
        distance: Math.round(distance),
        isNearby: distance <= 50 // Within 50 meters for AR interaction
      };
    });

    res.json({
      success: true,
      stars: starsWithDistance,
      count: starsWithDistance.length
    });

  } catch (error) {
    console.error('Error fetching nearby stars:', error);
    res.status(500).json({ error: 'Failed to fetch nearby stars' });
  }
});

// Discover a star (when user is within range)
router.post('/discover/:starId', authenticateToken, async (req: any, res) => {
  try {
    const { starId } = req.params;
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Current location is required' });
    }

    const star = await Star.findById(starId);
    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }

    // Check if user is within discovery range (50 meters)
    const distance = calculateDistance(
      latitude, longitude,
      star.location.coordinates.latitude,
      star.location.coordinates.longitude
    );

    if (distance > 50) {
      return res.status(400).json({ 
        error: 'You must be within 50 meters to discover this star',
        distance: Math.round(distance)
      });
    }

    // Check if user already discovered this star
    if (star.discoverers.includes(userId)) {
      return res.status(400).json({ error: 'You have already discovered this star' });
    }

    // Discover the star
    await star.discover(userId);

    // Update user stats
    const user = await User.findById(userId);
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

  } catch (error) {
    console.error('Error discovering star:', error);
    res.status(500).json({ error: 'Failed to discover star' });
  }
});

// Start AR challenge for a star
router.post('/challenge/:starId/start', authenticateToken, async (req: any, res) => {
  try {
    const { starId } = req.params;
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    const star = await Star.findById(starId);
    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }

    // Check if user has discovered the star
    if (!star.discoverers.includes(userId)) {
      return res.status(400).json({ error: 'You must discover the star first' });
    }

    // Check if user is within AR interaction range
    const distance = calculateDistance(
      latitude, longitude,
      star.location.coordinates.latitude,
      star.location.coordinates.longitude
    );

    if (distance > 10) { // 10 meters for AR interaction
      return res.status(400).json({ 
        error: 'You must be within 10 meters for AR interaction',
        distance: Math.round(distance)
      });
    }

    // Create challenge session
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

  } catch (error) {
    console.error('Error starting AR challenge:', error);
    res.status(500).json({ error: 'Failed to start AR challenge' });
  }
});

// Complete AR challenge
router.post('/challenge/:starId/complete', authenticateToken, async (req: any, res) => {
  try {
    const { starId } = req.params;
    const { proof, arInteractionData } = req.body;
    const userId = req.user.id;

    const star = await Star.findById(starId);
    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }

    // Verify AR interaction (this would integrate with your AR verification system)
    const isValidInteraction = await verifyARInteraction(arInteractionData, star);

    if (!isValidInteraction) {
      return res.status(400).json({ error: 'Invalid AR interaction' });
    }

    // Claim the star
    await star.claim(userId);

    // Update user rewards
    const user = await User.findById(userId);
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

  } catch (error) {
    console.error('Error completing AR challenge:', error);
    res.status(500).json({ error: 'Failed to complete AR challenge' });
  }
});

// Get user's discovered stars
router.get('/discovered', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const discoveredStars = await Star.find({
      discoverers: userId
    }).populate('quest', 'name description');

    res.json({
      success: true,
      stars: discoveredStars,
      count: discoveredStars.length
    });

  } catch (error) {
    console.error('Error fetching discovered stars:', error);
    res.status(500).json({ error: 'Failed to fetch discovered stars' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lon2 - lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Helper function to verify AR interaction (placeholder)
async function verifyARInteraction(arData: any, star: any): Promise<boolean> {
  // This would integrate with your AR verification system
  // For now, return true as a placeholder
  return true;
}

export default router;

