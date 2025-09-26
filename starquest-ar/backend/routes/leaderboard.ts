import { Router } from 'express';
import { User } from '../models/User';
import { Star } from '../models/Star';
import { Quest } from '../models/Quest';
import { Request, Response } from 'express';

const router = Router();

// Get leaderboard by category
router.get('/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 50, offset = 0, period = 'all' } = req.query;
    
    let leaderboard: any[] = [];
    
    switch (category) {
      case 'stars':
        leaderboard = await getStarsLeaderboard(Number(limit), Number(offset), period as string);
        break;
      case 'quests':
        leaderboard = await getQuestsLeaderboard(Number(limit), Number(offset), period as string);
        break;
      case 'streak':
        leaderboard = await getStreakLeaderboard(Number(limit), Number(offset), period as string);
        break;
      case 'experience':
        leaderboard = await getExperienceLeaderboard(Number(limit), Number(offset), period as string);
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    res.status(200).json({
      category,
      period,
      leaderboard,
      total: leaderboard.length,
      hasMore: Number(offset) + Number(limit) < leaderboard.length,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user's position in leaderboard
router.get('/:category/position/:userId', async (req: Request, res: Response) => {
  try {
    const { category, userId } = req.params;
    
    let position = 0;
    let totalUsers = 0;
    
    switch (category) {
      case 'stars':
        const userStars = await User.findById(userId).select('starsFound');
        if (!userStars) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        totalUsers = await User.countDocuments();
        const usersWithMoreStars = await User.countDocuments({
          starsFound: { $gt: userStars.starsFound }
        });
        position = usersWithMoreStars + 1;
        break;
        
      case 'streak':
        const userStreak = await User.findById(userId).select('streak');
        if (!userStreak) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        totalUsers = await User.countDocuments();
        const usersWithMoreStreak = await User.countDocuments({
          streak: { $gt: userStreak.streak }
        });
        position = usersWithMoreStreak + 1;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    const percentile = Math.round(((totalUsers - position + 1) / totalUsers) * 100);

    res.status(200).json({
      category,
      position,
      percentile,
      totalUsers,
    });
  } catch (error) {
    console.error('Error getting user position:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get leaderboard statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    const topStarHunter = await User.findOne().sort({ starsFound: -1 }).select('username starsFound');
    const topStreakHolder = await User.findOne().sort({ streak: -1 }).select('username streak');
    
    const averageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgStars: { $avg: '$starsFound' },
          avgQuests: { $avg: '$questsCompleted' },
          avgStreak: { $avg: '$streak' },
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      activeUsers,
      topStarHunter,
      topStreakHolder,
      averages: averageStats[0] || {},
    });
  } catch (error) {
    console.error('Error getting leaderboard statistics:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Helper functions
async function getStarsLeaderboard(limit: number, offset: number, period: string) {
  let dateFilter = {};
  
  if (period !== 'all') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    dateFilter = { updatedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
  }

  const users = await User.find(dateFilter)
    .select('username starsFound questsCompleted nftsEarned streak avatar')
    .sort({ starsFound: -1 })
    .limit(limit)
    .skip(offset);

  return users.map((user, index) => ({
    rank: offset + index + 1,
    user: {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
    },
    score: user.starsFound,
    stats: {
      questsCompleted: user.questsCompleted,
      nftsEarned: user.nftsEarned,
      streak: user.streak,
    },
  }));
}

async function getQuestsLeaderboard(limit: number, offset: number, period: string) {
  let dateFilter = {};
  
  if (period !== 'all') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    dateFilter = { updatedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
  }

  const users = await User.find(dateFilter)
    .select('username questsCompleted starsFound nftsEarned streak avatar')
    .sort({ questsCompleted: -1 })
    .limit(limit)
    .skip(offset);

  return users.map((user, index) => ({
    rank: offset + index + 1,
    user: {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
    },
    score: user.questsCompleted,
    stats: {
      starsFound: user.starsFound,
      nftsEarned: user.nftsEarned,
      streak: user.streak,
    },
  }));
}

async function getStreakLeaderboard(limit: number, offset: number, period: string) {
  let dateFilter = {};
  
  if (period !== 'all') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    dateFilter = { updatedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
  }

  const users = await User.find(dateFilter)
    .select('username streak starsFound questsCompleted nftsEarned avatar')
    .sort({ streak: -1 })
    .limit(limit)
    .skip(offset);

  return users.map((user, index) => ({
    rank: offset + index + 1,
    user: {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
    },
    score: user.streak,
    stats: {
      starsFound: user.starsFound,
      questsCompleted: user.questsCompleted,
      nftsEarned: user.nftsEarned,
    },
  }));
}

async function getExperienceLeaderboard(limit: number, offset: number, period: string) {
  let dateFilter = {};
  
  if (period !== 'all') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    dateFilter = { updatedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } };
  }

  // Calculate experience based on stars and quests
  const users = await User.find(dateFilter)
    .select('username starsFound questsCompleted nftsEarned streak avatar')
    .sort({ starsFound: -1, questsCompleted: -1 })
    .limit(limit)
    .skip(offset);

  return users.map((user, index) => {
    const experience = (user.starsFound * 100) + (user.questsCompleted * 50) + (user.streak * 10);
    
    return {
      rank: offset + index + 1,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      score: experience,
      stats: {
        starsFound: user.starsFound,
        questsCompleted: user.questsCompleted,
        nftsEarned: user.nftsEarned,
        streak: user.streak,
      },
    };
  });
}

export default router;
