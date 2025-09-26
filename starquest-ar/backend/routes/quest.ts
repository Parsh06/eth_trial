import express, { Request, Response } from 'express';
import { Quest } from '../models/Quest';
import { User } from '../models/User';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress: string;
  };
}

const router = express.Router();

// Middleware to authenticate JWT token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
}

// Get all active quests
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      location, 
      radius = 10000,
      limit = 20, 
      page = 1 
    } = req.query;
    
    const filter: any = { status: 'active' };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    if (location) {
      const locationStr = Array.isArray(location) ? location[0] : location;
      if (typeof locationStr === 'string') {
        const [lat, lng] = locationStr.split(',').map(Number);
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: Number(radius)
          }
        };
      }
    }
    
    const quests = await Quest.find(filter)
      .populate('creator', 'username avatar level')
      .populate('stars', 'name rarity type')
      .sort({ 'metadata.featured': -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();
    
    res.json({
      success: true,
      quests: quests.map(quest => ({
        id: quest._id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        category: quest.category,
        location: quest.location,
        stars: quest.stars,
        rewards: quest.rewards,
        requirements: quest.requirements,
        creator: quest.creator,
        participantCount: quest.participants.length,
        maxParticipants: quest.maxParticipants,
        startDate: quest.startDate,
        endDate: quest.endDate,
        metadata: quest.metadata,
        isFull: quest.participants.length >= (quest.maxParticipants || Infinity)
      }))
    });
    
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quest by ID
router.get('/:id', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate('creator', 'username avatar level')
      .populate('stars', 'name rarity type location metadata')
      .populate('participants', 'username avatar level')
      .lean();
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    res.json({
      success: true,
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        category: quest.category,
        location: quest.location,
        stars: quest.stars,
        rewards: quest.rewards,
        requirements: quest.requirements,
        status: quest.status,
        creator: quest.creator,
        participants: quest.participants,
        maxParticipants: quest.maxParticipants,
        startDate: quest.startDate,
        endDate: quest.endDate,
        metadata: quest.metadata,
        participantCount: quest.participantCount,
        isFull: quest.isFull
      }
    });
    
  } catch (error) {
    console.error('Get quest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new quest
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      location,
      stars,
      rewards,
      requirements,
      maxParticipants,
      startDate,
      endDate,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const quest = new Quest({
      title,
      description,
      difficulty,
      category,
      location,
      stars: stars || [],
      rewards: rewards || { experience: 0 },
      requirements: requirements || {},
      creator: req.user?.userId,
      maxParticipants,
      startDate: startDate || new Date(),
      endDate,
      metadata: {
        tags: metadata?.tags || [],
        featured: false,
        verified: false,
        rating: 0,
        completionRate: 0,
        ...metadata
      }
    });
    
    await quest.save();
    
    // Add creator as first participant
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await quest.addParticipant(req.user.userId);
    
    res.status(201).json({
      success: true,
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        category: quest.category,
        location: quest.location,
        status: quest.status,
        creator: quest.creator,
        participantCount: quest.participantCount
      }
    });
    
  } catch (error) {
    console.error('Create quest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join quest
router.post('/:id/join', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    if (quest.status !== 'active') {
      return res.status(400).json({ error: 'Quest is not active' });
    }
    
    // Check if user meets requirements
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (quest.requirements.minLevel && user.level < quest.requirements.minLevel) {
      return res.status(400).json({ error: 'Insufficient level' });
    }
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await quest.addParticipant(req.user.userId);
    
    res.json({
      success: true,
      message: 'Successfully joined quest'
    });
    
  } catch (error) {
    console.error('Join quest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave quest
router.post('/:id/leave', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    await quest.removeParticipant(req.user.userId);
    
    res.json({
      success: true,
      message: 'Successfully left quest'
    });
    
  } catch (error) {
    console.error('Leave quest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's quests
router.get('/user/my-quests', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status = 'all', limit = 20, page = 1 } = req.query;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const filter: any = { participants: req.user.userId };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    const quests = await Quest.find(filter)
      .populate('creator', 'username avatar')
      .populate('stars', 'name rarity')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();
    
    res.json({
      success: true,
      quests: quests.map(quest => ({
        id: quest._id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        category: quest.category,
        status: quest.status,
        creator: quest.creator,
        stars: quest.stars,
        participantCount: quest.participants.length,
        startDate: quest.startDate,
        endDate: quest.endDate
      }))
    });
    
  } catch (error) {
    console.error('Get user quests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;

