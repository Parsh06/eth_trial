import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { WalletService } from '../services/WalletService';
import { Web3Service } from '../services/Web3Service';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress: string;
  };
}

const router = express.Router();

// Initialize services (these will be injected from the main server)
let walletService: WalletService;
let web3Service: Web3Service;

// Middleware to initialize services from app locals
router.use((req, res, next) => {
  web3Service = req.app.locals.web3Service;
  if (!walletService) {
    walletService = new WalletService(web3Service);
  }
  next();
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
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    
    req.user = user;
    next();
  });
}

// GET /api/wallet/collection - Get user's NFT collection
router.get('/collection', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address not found' });
    }

    const {
      limit = '20',
      offset = '0',
      sortBy = 'discoveredAt',
      sortOrder = 'desc',
      rarity,
      starType,
      status
    } = req.query;

    const options = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      rarity: rarity as string,
      starType: starType as string,
      status: status as string
    };

    const collection = await walletService.getUserNFTs(walletAddress, options);

    res.json({
      success: true,
      data: collection
    });

  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT collection',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/summary - Get wallet overview/summary
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

  } catch (error) {
    console.error('Get wallet summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/info - Get wallet blockchain information
router.get('/info', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

  } catch (error) {
    console.error('Get wallet info error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/nft/:contractAddress/:tokenId - Get specific NFT details
router.get('/nft/:contractAddress/:tokenId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

  } catch (error) {
    console.error('Get NFT details error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/nft/:contractAddress/:tokenId/metadata - Get NFT metadata (OpenSea compatible)
router.get('/nft/:contractAddress/:tokenId/metadata', async (req: Request, res: Response) => {
  try {
    const { contractAddress, tokenId } = req.params;

    const metadata = await walletService.getNFTMetadata(contractAddress, tokenId);

    res.json(metadata);

  } catch (error) {
    console.error('Get NFT metadata error:', error);
    res.status(404).json({ 
      error: 'NFT not found',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/wallet/nft/:contractAddress/:tokenId/like - Like an NFT
router.post('/nft/:contractAddress/:tokenId/like', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

  } catch (error) {
    console.error('Like NFT error:', error);
    res.status(500).json({ 
      error: 'Failed to like NFT',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/wallet/nft/mint - Mint a new NFT (when star is claimed)
router.post('/nft/mint', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address not found' });
    }

    const {
      starId,
      tokenId,
      contractAddress,
      name,
      description,
      imageUrl,
      rarity,
      starType,
      attributes,
      questId,
      transactionHash
    } = req.body;

    // Validate required fields
    if (!starId || !tokenId || !contractAddress || !name || !description || !imageUrl || !rarity || !starType) {
      return res.status(400).json({ error: 'Missing required fields for NFT minting' });
    }

    const nft = await walletService.createNFT({
      starId,
      tokenId,
      contractAddress,
      owner: walletAddress,
      discoverer: walletAddress, // Same as owner for minting
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

  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({ 
      error: 'Failed to mint NFT',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/wallet/nft/:contractAddress/:tokenId/transfer - Transfer NFT
router.post('/nft/:contractAddress/:tokenId/transfer', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

    const nft = await walletService.transferNFT(
      contractAddress,
      tokenId,
      fromAddress,
      toAddress,
      transactionHash
    );

    res.json({
      success: true,
      data: nft
    });

  } catch (error) {
    console.error('Transfer NFT error:', error);
    res.status(500).json({ 
      error: 'Failed to transfer NFT',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/stats - Get detailed wallet statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/wallet/activity - Get wallet activity history
router.get('/activity', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address not found' });
    }

    const { limit = '10', offset = '0' } = req.query;

    // For now, we'll use the recent activity from wallet summary
    // In a production app, you'd have a dedicated activity log
    const summary = await walletService.getWalletSummary(walletAddress);

    res.json({
      success: true,
      data: {
        activities: summary.recentActivity.slice(
          parseInt(offset as string),
          parseInt(offset as string) + parseInt(limit as string)
        ),
        total: summary.recentActivity.length,
        hasMore: parseInt(offset as string) + parseInt(limit as string) < summary.recentActivity.length
      }
    });

  } catch (error) {
    console.error('Get wallet activity error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
