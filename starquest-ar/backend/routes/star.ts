import { Router } from 'express';
import { Star } from '../models/Star';
import { Request, Response } from 'express';

const router = Router();

// Get all stars
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, difficulty, limit = 50, offset = 0 } = req.query;
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const stars = await Star.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 });

    const total = await Star.countDocuments(query);

    res.status(200).json({
      stars,
      total,
      hasMore: Number(offset) + Number(limit) < total,
    });
  } catch (error) {
    console.error('Error getting stars:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get star by ID
router.get('/:starId', async (req: Request, res: Response) => {
  try {
    const { starId } = req.params;
    const star = await Star.findById(starId);
    
    if (!star) {
      return res.status(404).json({ message: 'Star not found' });
    }

    res.status(200).json(star);
  } catch (error) {
    console.error('Error getting star:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create new star
router.post('/', async (req: Request, res: Response) => {
  try {
    const starData = req.body;
    const newStar = new Star(starData);
    await newStar.save();
    
    res.status(201).json(newStar);
  } catch (error) {
    console.error('Error creating star:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update star
router.put('/:starId', async (req: Request, res: Response) => {
  try {
    const { starId } = req.params;
    const updates = req.body;
    
    const star = await Star.findByIdAndUpdate(
      starId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!star) {
      return res.status(404).json({ message: 'Star not found' });
    }

    res.status(200).json(star);
  } catch (error) {
    console.error('Error updating star:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Discover star
router.post('/:starId/discover', async (req: Request, res: Response) => {
  try {
    const { starId } = req.params;
    const { userId, position } = req.body;
    
    const star = await Star.findById(starId);
    
    if (!star) {
      return res.status(404).json({ message: 'Star not found' });
    }

    if (star.status !== 'available') {
      return res.status(400).json({ message: 'Star is not available for discovery' });
    }

    // Update star status to completed
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
  } catch (error) {
    console.error('Error discovering star:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get stars by user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query: any = { discoveredBy: userId };
    
    if (status) {
      query.status = status;
    }

    const stars = await Star.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ discoveredAt: -1 });

    const total = await Star.countDocuments(query);

    res.status(200).json({
      stars,
      total,
      hasMore: Number(offset) + Number(limit) < total,
    });
  } catch (error) {
    console.error('Error getting user stars:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get stars by position (for map view)
router.get('/map/position', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Simple radius-based search (in a real app, you'd use proper geospatial queries)
    const stars = await Star.find({
      status: 'available',
      'position.lat': {
        $gte: Number(lat) - (Number(radius) / 111000), // Rough conversion
        $lte: Number(lat) + (Number(radius) / 111000),
      },
      'position.lng': {
        $gte: Number(lng) - (Number(radius) / 111000),
        $lte: Number(lng) + (Number(radius) / 111000),
      },
    });

    res.status(200).json(stars);
  } catch (error) {
    console.error('Error getting stars by position:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get star statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const totalStars = await Star.countDocuments();
    const availableStars = await Star.countDocuments({ status: 'available' });
    const completedStars = await Star.countDocuments({ status: 'completed' });
    const lockedStars = await Star.countDocuments({ status: 'locked' });

    const difficultyStats = await Star.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    const rarityStats = await Star.aggregate([
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
  } catch (error) {
    console.error('Error getting star statistics:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete star
router.delete('/:starId', async (req: Request, res: Response) => {
  try {
    const { starId } = req.params;
    
    const star = await Star.findByIdAndDelete(starId);
    
    if (!star) {
      return res.status(404).json({ message: 'Star not found' });
    }

    res.status(200).json({ message: 'Star deleted successfully' });
  } catch (error) {
    console.error('Error deleting star:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
