# 🚀 StarQuest AR - Local Development Setup

## 🎯 **Quick Local Setup Guide**

Let's get your entire StarQuest AR project running locally step by step!

## 📋 **Prerequisites**
- ✅ **Node.js** (v18+)
- ✅ **npm** or **yarn**
- ✅ **Expo CLI** (`npm install -g @expo/cli`)
- ✅ **VS Code** (or your preferred editor)

## 🚀 **Step 1: Fix Smart Contracts (Local Network)**

### **Navigate to Contracts Directory:**
```bash
cd starquest-ar/contracts
```

### **Install Dependencies:**
```bash
npm install
```

### **Compile Contracts:**
```bash
npm run compile
```

### **Deploy to Local Network:**
```bash
npm run deploy
```

---

## 🚀 **Step 2: Fix Backend API**

### **Navigate to Backend Directory:**
```bash
cd starquest-ar/backend
```

### **Install Dependencies:**
```bash
npm install
```

### **Create Environment File:**
```bash
# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/starquest" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=3000" >> .env
```

### **Start MongoDB (if not running):**
```bash
# Install MongoDB locally or use MongoDB Atlas
# For local MongoDB, make sure it's running on port 27017
```

### **Build and Start Backend:**
```bash
npm run build
npm run dev
```

---

## 🚀 **Step 3: Fix Mobile App**

### **Navigate to Mobile Directory:**
```bash
cd starquest-ar/mobile
```

### **Install Dependencies:**
```bash
npm install
```

### **Start Mobile App:**
```bash
npm start
```

---

## 🚀 **Step 4: Fix Integration SDK**

### **Navigate to Integration Directory:**
```bash
cd starquest-ar/starquest-integration
```

### **Install Dependencies:**
```bash
npm install
```

### **Fix __dirname Issue:**
```bash
# The __dirname issue is because it's an ES module
# We'll fix this in the code
```

---

## 🎯 **Complete Local Development Setup**

### **Terminal 1: Smart Contracts (Local Network)**
```bash
cd starquest-ar/contracts
npm install
npm run compile
npm run deploy
```

### **Terminal 2: Backend API**
```bash
cd starquest-ar/backend
npm install
npm run build
npm run dev
```

### **Terminal 3: Mobile App**
```bash
cd starquest-ar/mobile
npm install
npm start
```

### **Terminal 4: Integration SDK (Optional)**
```bash
cd starquest-ar/starquest-integration
npm install
npm run example:basic
```

## 🔧 **Quick Fixes for Current Issues**

### **1. Fix Hardhat Dependencies:**
```bash
cd starquest-ar/contracts
npm install --legacy-peer-deps
```

### **2. Fix MongoDB Connection:**
```bash
# Option 1: Use MongoDB Atlas (cloud)
# Option 2: Install MongoDB locally
# Option 3: Use SQLite for local development
```

### **3. Fix StarQuest Integration:**
```bash
cd starquest-ar/starquest-integration
# We'll fix the __dirname issue in the code
```

## 🎮 **Test the Complete System**

### **1. Start All Services:**
```bash
# Terminal 1: Contracts
cd starquest-ar/contracts && npm run deploy

# Terminal 2: Backend
cd starquest-ar/backend && npm run dev

# Terminal 3: Mobile
cd starquest-ar/mobile && npm start
```

### **2. Test Mobile App:**
1. **Open Expo Go** on your phone
2. **Scan QR code** from terminal
3. **Navigate to Map Screen**
4. **Test staking functionality**

### **3. Test Backend API:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get stars
curl http://localhost:3000/api/stars
```

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Smart Contract Issues:**
```bash
# Clear Hardhat cache
npx hardhat clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
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

## 🎉 **Success Checklist**

### **✅ Local Development Running:**
- [ ] Smart contracts compiled and deployed locally
- [ ] Backend API running on port 3000
- [ ] Mobile app running with Expo
- [ ] All services communicating properly

### **✅ Next Steps:**
- [ ] Test staking functionality
- [ ] Test game completion
- [ ] Test Web3 integration
- [ ] Deploy to Hedera testnet (later)

## 🚀 **Quick Start Commands**

```bash
# Complete local setup in one go
cd starquest-ar

# Smart contracts
cd contracts && npm install --legacy-peer-deps && npm run compile && npm run deploy

# Backend API
cd ../backend && npm install && npm run build && npm run dev

# Mobile app
cd ../mobile && npm install && npm start

# Integration SDK
cd ../starquest-integration && npm install && npm run example:basic
```

**Your StarQuest AR project is now ready for local development!** 🎉

## 📞 **Need Help?**

If you encounter any issues:
1. **Check the console** for error messages
2. **Verify all dependencies** are installed
3. **Ensure ports** are not in use
4. **Check network connectivity**
5. **Review configuration files**

**Happy coding!** 🚀
