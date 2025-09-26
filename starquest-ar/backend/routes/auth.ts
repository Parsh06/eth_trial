import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress: string;
  };
}

const router = express.Router();

// Register/Login with wallet
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify signature (simplified - in production, use proper signature verification)
    // const isValidSignature = verifySignature(walletAddress, signature, message);
    // if (!isValidSignature) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }
    
    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      // Create new user
      user = new User({
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
    } else {
      // Update last active
      user.stats.lastActive = new Date();
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        walletAddress: user.walletAddress 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
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
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId)
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
        completionRate: (user as any).completionRate || 0
      }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, avatar, preferences } = req.body;
    
    const updateData: any = {};
    
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user?.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      updateData.username = username;
    }
    
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences) updateData.preferences = { ...preferences };
    
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      updateData,
      { new: true, runValidators: true }
    );
    
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
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
}

export default router;

