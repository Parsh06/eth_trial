import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import questRoutes from './routes/quest';
import starRoutes from './routes/star';
import leaderboardRoutes from './routes/leaderboard';
import walletRoutes from './routes/wallet';

// Import services
import { Web3Service } from './services/Web3Service';
import { ARService } from './services/ARService';
import { NotificationService } from './services/NotificationService';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starquest';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialize services
const web3Service = new Web3Service();
const arService = new ARService();
const notificationService = new NotificationService(io);

// Make services available to routes
app.locals.web3Service = web3Service;
app.locals.arService = arService;
app.locals.notificationService = notificationService;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/star', starRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      web3: web3Service.isConnected() ? 'connected' : 'disconnected'
    }
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  socket.on('join-quest', (questId) => {
    socket.join(`quest-${questId}`);
    console.log(`User ${socket.id} joined quest ${questId}`);
  });
  
  socket.on('star-found', async (data) => {
    const { questId, userId, starId } = data;
    
    // Broadcast to all users in the quest
    socket.to(`quest-${questId}`).emit('star-discovered', {
      userId,
      starId,
      timestamp: new Date().toISOString()
    });
    
    // Update leaderboard
    await notificationService.updateLeaderboard(questId);
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 StarQuest Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

