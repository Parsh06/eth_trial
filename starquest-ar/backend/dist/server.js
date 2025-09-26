"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const quest_1 = __importDefault(require("./routes/quest"));
const star_1 = __importDefault(require("./routes/star"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const Web3Service_1 = require("./services/Web3Service");
const ARService_1 = require("./services/ARService");
const NotificationService_1 = require("./services/NotificationService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starquest';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
const web3Service = new Web3Service_1.Web3Service();
const arService = new ARService_1.ARService();
const notificationService = new NotificationService_1.NotificationService(io);
app.locals.web3Service = web3Service;
app.locals.arService = arService;
app.locals.notificationService = notificationService;
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/quest', quest_1.default);
app.use('/api/star', star_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
            web3: web3Service.isConnected() ? 'connected' : 'disconnected'
        }
    });
});
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    socket.on('join-quest', (questId) => {
        socket.join(`quest-${questId}`);
        console.log(`User ${socket.id} joined quest ${questId}`);
    });
    socket.on('star-found', async (data) => {
        const { questId, userId, starId } = data;
        socket.to(`quest-${questId}`).emit('star-discovered', {
            userId,
            starId,
            timestamp: new Date().toISOString()
        });
        await notificationService.updateLeaderboard(questId);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
server.listen(PORT, () => {
    console.log(`🚀 StarQuest Backend running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map