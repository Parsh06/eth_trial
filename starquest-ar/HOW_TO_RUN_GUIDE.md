# 🚀 How to Run StarQuest AR - Complete Guide

## 🎯 **Project Overview**

Your StarQuest AR project has **4 main components** that need to be run:

1. **📱 Mobile App** (React Native/Expo)
2. **🖥️ Backend API** (Node.js/Express)
3. **🔗 Smart Contracts** (Solidity/Hardhat)
4. **📦 Integration SDK** (JavaScript library)

## 📋 **Prerequisites**

### **Required Software:**
- ✅ **Node.js** (v18+)
- ✅ **npm** or **yarn**
- ✅ **Expo CLI** (`npm install -g @expo/cli`)
- ✅ **Git**
- ✅ **Code Editor** (VS Code recommended)

### **Optional but Recommended:**
- ✅ **Android Studio** (for Android development)
- ✅ **Xcode** (for iOS development)
- ✅ **Metamask** (for Web3 testing)

## 🚀 **Step-by-Step Running Guide**

### **1. 📱 Mobile App (React Native/Expo)**

#### **Navigate to Mobile Directory:**
```bash
cd starquest-ar/mobile
```

#### **Install Dependencies:**
```bash
npm install
# or
yarn install
```

#### **Start Development Server:**
```bash
# Start Expo development server
npm start

# Alternative commands:
npm run start:dev    # Development client
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

#### **Access Mobile App:**
- **Expo Go App**: Scan QR code with Expo Go app
- **Web Browser**: Press 'w' in terminal
- **Android Emulator**: Press 'a' in terminal
- **iOS Simulator**: Press 'i' in terminal

---

### **2. 🖥️ Backend API (Node.js/Express)**

#### **Navigate to Backend Directory:**
```bash
cd starquest-ar/backend
```

#### **Install Dependencies:**
```bash
npm install
```

#### **Build TypeScript:**
```bash
npm run build
```

#### **Start Backend Server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

#### **Backend API Endpoints:**
- **Base URL**: `http://localhost:3000`
- **Health Check**: `GET /api/health`
- **Authentication**: `POST /api/auth/login`
- **Stars**: `GET /api/stars`
- **Quests**: `GET /api/quests`

---

### **3. 🔗 Smart Contracts (Solidity/Hardhat)**

#### **Navigate to Contracts Directory:**
```bash
cd starquest-ar/contracts
```

#### **Install Dependencies:**
```bash
npm install
```

#### **Compile Contracts:**
```bash
npm run compile
```
s
#### **Run Tests:**
```bash
npm test
```

#### **Deploy Contracts:**
```bash
# Deploy to local network
npm run deploy

# Deploy to testnet
npm run deploy:sepolia
npm run deploy:polygon
npm run deploy:mumbai
```

#### **Verify Contracts:**
```bash
npm run verify
```

---

### **4. 📦 Integration SDK (JavaScript Library)**

#### **Navigate to Integration Directory:**
```bash
cd starquest-ar/starquest-integration
```

#### **Install Dependencies:**
```bash
npm install
```

#### **Run Examples:**
```bash
# Basic usage example
npm run example:basic

# Gameplay example
npm run example:gameplay

# Admin example
npm run example:admin
```

#### **Test Integration:**
```bash
npm test
```

---

## 🎯 **Complete Development Setup**

### **Terminal 1: Mobile App**
```bash
cd starquest-ar/mobile
npm install
npm start
```

### **Terminal 2: Backend API**
```bash
cd starquest-ar/backend
npm install
npm run build
npm run dev
```

### **Terminal 3: Smart Contracts (Optional)**
```bash
cd starquest-ar/contracts
npm install
npm run compile
```

### **Terminal 4: Integration SDK (Optional)**
```bash
cd starquest-ar/starquest-integration
npm install
npm run example:basic
```

## 🔧 **Configuration Files**

### **Mobile App Configuration:**
```typescript
// mobile/src/config/environment.ts
export const config = {
  API_BASE_URL: 'http://localhost:3000',
  BLOCKCHAIN_NETWORK: 'hedera-testnet',
  WALLET_PRIVATE_KEY: 'your-private-key'
};
```

### **Backend Configuration:**
```typescript
// backend/config.ts
export const config = {
  PORT: 3000,
  MONGODB_URI: 'mongodb://localhost:27017/starquest',
  JWT_SECRET: 'your-jwt-secret'
};
```

### **Smart Contracts Configuration:**
```typescript
// contracts/hardhat.config.ts
export default {
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      accounts: ['YOUR_PRIVATE_KEY']
    }
  }
};
```

## 🎮 **Testing the Complete System**

### **1. Start All Services:**
```bash
# Terminal 1: Mobile App
cd starquest-ar/mobile && npm start

# Terminal 2: Backend API
cd starquest-ar/backend && npm run dev

# Terminal 3: Smart Contracts (if needed)
cd starquest-ar/contracts && npm run compile
```

### **2. Test Mobile App:**
1. **Open Expo Go** on your phone
2. **Scan QR code** from terminal
3. **Navigate to Map Screen**
4. **Test staking functionality**
5. **Test game completion**

### **3. Test Backend API:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get stars
curl http://localhost:3000/api/stars

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### **4. Test Smart Contracts:**
```bash
# Run contract tests
cd starquest-ar/contracts
npm test

# Deploy to local network
npm run deploy
```

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Mobile App Issues:**
```bash
# Clear cache and restart
npm run clean

# Reset Expo cache
expo r -c

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Backend Issues:**
```bash
# Check if port is available
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Rebuild TypeScript
npm run build
```

#### **Smart Contract Issues:**
```bash
# Clear Hardhat cache
npx hardhat clean

# Recompile contracts
npm run compile

# Check network configuration
npx hardhat console --network localhost
```

## 🎯 **Production Deployment**

### **Mobile App:**
```bash
# Build for production
expo build:android
expo build:ios

# Or use EAS Build
eas build --platform android
eas build --platform ios
```

### **Backend API:**
```bash
# Build and start production
npm run build
npm start

# Or use PM2 for process management
pm2 start dist/server.js --name starquest-api
```

### **Smart Contracts:**
```bash
# Deploy to mainnet
npm run deploy:mainnet

# Verify contracts
npm run verify
```

## 🎉 **Success Checklist**

### **✅ Mobile App Running:**
- [ ] Expo development server started
- [ ] QR code displayed in terminal
- [ ] App opens on device/emulator
- [ ] Map screen loads correctly
- [ ] Staking screen works

### **✅ Backend API Running:**
- [ ] Server starts on port 3000
- [ ] Health check endpoint responds
- [ ] Database connection established
- [ ] API endpoints accessible

### **✅ Smart Contracts:**
- [ ] Contracts compile successfully
- [ ] Tests pass
- [ ] Deployment successful
- [ ] Contract addresses available

### **✅ Integration SDK:**
- [ ] Examples run without errors
- [ ] Web3 connection established
- [ ] Contract interactions work

## 🚀 **Quick Start Commands**

```bash
# Complete setup in one go
cd starquest-ar

# Mobile app
cd mobile && npm install && npm start

# Backend API (in new terminal)
cd backend && npm install && npm run dev

# Smart contracts (in new terminal)
cd contracts && npm install && npm run compile

# Integration SDK (in new terminal)
cd starquest-integration && npm install && npm run example:basic
```

**Your StarQuest AR project is now ready to run!** 🎉

## 📞 **Need Help?**

If you encounter any issues:
1. **Check the console** for error messages
2. **Verify all dependencies** are installed
3. **Ensure ports** are not in use
4. **Check network connectivity** for blockchain interactions
5. **Review configuration files** for correct settings

**Happy coding!** 🚀
