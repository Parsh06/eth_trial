"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/starquest',
    },
    server: {
        port: parseInt(process.env.PORT || '5000'),
        nodeEnv: process.env.NODE_ENV || 'development',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'starquest-super-secret-jwt-key-2024',
        expiresIn: '7d',
    },
    web3: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id',
        privateKey: process.env.PRIVATE_KEY || '',
        contractAddress: process.env.CONTRACT_ADDRESS || '',
    },
    ar: {
        apiKey: process.env.AR_API_KEY || '',
        serviceUrl: process.env.AR_SERVICE_URL || 'https://api.ar-service.com',
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(','),
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
};
//# sourceMappingURL=config.js.map