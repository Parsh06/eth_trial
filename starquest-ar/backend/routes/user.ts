import { Router } from 'express';
import { User } from '../models/User';
import { Request, Response } from 'express';

const router = Router();

// Get user profile
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update user profile
router.put('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user stats
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = {
      starsFound: user.starsFound,
      questsCompleted: user.questsCompleted,
      nftsEarned: user.nftsEarned,
      streak: user.streak,
      achievements: user.achievements,
      level: Math.floor(user.starsFound / 5) + 1, // Simple level calculation
      experience: (user.starsFound % 5) * 20, // Simple experience calculation
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update user stats
router.put('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { starsFound, questsCompleted, nftsEarned, streak, achievements } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          starsFound: starsFound || 0,
          questsCompleted: questsCompleted || 0,
          nftsEarned: nftsEarned || 0,
        },
        $set: {
          streak: streak || 0,
          achievements: achievements || [],
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user achievements
router.get('/achievements/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      achievements: user.achievements,
      totalAchievements: user.achievements.length,
    });
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add achievement
router.post('/achievements/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { achievement } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { achievements: achievement },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user leaderboard position
router.get('/leaderboard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate user's position in leaderboard
    const totalUsers = await User.countDocuments();
    const usersWithMoreStars = await User.countDocuments({
      starsFound: { $gt: user.starsFound }
    });
    
    const position = usersWithMoreStars + 1;
    const percentile = Math.round(((totalUsers - position + 1) / totalUsers) * 100);

    res.status(200).json({
      position,
      percentile,
      totalUsers,
      starsFound: user.starsFound,
    });
  } catch (error) {
    console.error('Error getting user leaderboard position:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user's recent activity
router.get('/activity/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // This would typically come from an activity log
    // For now, we'll return mock data
    const activities = [
      {
        id: 'activity-1',
        type: 'star-discovered',
        title: 'Star Discovered',
        description: 'You found Alpha Star',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        points: 100,
      },
      {
        id: 'activity-2',
        type: 'quest-completed',
        title: 'Quest Completed',
        description: 'Daily Star Hunt completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        points: 250,
      },
      {
        id: 'activity-3',
        type: 'achievement-unlocked',
        title: 'Achievement Unlocked',
        description: 'First Star achievement earned',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        points: 50,
      },
    ];

    res.status(200).json({
      activities: activities.slice(Number(offset), Number(offset) + Number(limit)),
      total: activities.length,
      hasMore: Number(offset) + Number(limit) < activities.length,
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete user account
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
