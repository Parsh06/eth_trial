# 🚀 StarQuest AR - Hedera Testnet Deployment Guide

## 🎯 **Overview**

This guide will help you deploy your StarQuest AR smart contracts to **Hedera Testnet** step by step. Hedera uses a different approach than Ethereum, so we'll need to configure it properly.

## 📋 **Prerequisites**

### **Required Software:**
- ✅ **Node.js** (v18+)
- ✅ **npm** or **yarn**
- ✅ **VS Code** (or your preferred editor)
- ✅ **Git**

### **Hedera Requirements:**
- ✅ **Hedera Testnet Account** (free)
- ✅ **Test HBAR** (free from faucet)
- ✅ **Private Key** (from Hedera account)

## 🔧 **Step 1: Install Hedera Dependencies**

### **Navigate to Contracts Directory:**
```bash
cd starquest-ar/contracts
```

### **Install Hedera Dependencies:**
```bash
npm install @hashgraph/sdk @hashgraph/hardhat-plugin
```

## 🔧 **Step 2: Configure Hardhat for Hedera**

### **Update hardhat.config.ts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@hashgraph/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: process.env.HEDERA_PRIVATE_KEY ? [process.env.HEDERA_PRIVATE_KEY] : [],
      chainId: 296,
    },
    hedera_mainnet: {
      url: "https://mainnet.hashio.io/api",
      accounts: process.env.HEDERA_PRIVATE_KEY ? [process.env.HEDERA_PRIVATE_KEY] : [],
      chainId: 295,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
```

## 🔧 **Step 3: Create Environment Variables**

### **Create .env file:**
```bash
# Create .env file in contracts directory
touch .env
```

### **Add Hedera Configuration:**
```env
# Hedera Testnet Configuration
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_ACCOUNT_ID=your_account_id_here
HEDERA_NETWORK=testnet

# Optional: For mainnet deployment
HEDERA_MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
HEDERA_MAINNET_ACCOUNT_ID=your_mainnet_account_id_here
```

## 🔧 **Step 4: Update Deployment Script**

### **Create Hedera-specific deployment script:**
```typescript
// contracts/scripts/deploy-hedera.ts
import { ethers } from "hardhat";
import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";

async function main() {
  console.log("🚀 Deploying StarQuest contracts to Hedera Testnet...");

  // Get Hedera configuration
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  
  if (!privateKey || !accountId) {
    throw new Error("Please set HEDERA_PRIVATE_KEY and HEDERA_ACCOUNT_ID in .env");
  }

  // Initialize Hedera client
  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));

  // Get the contract factories
  const StarQuest = await ethers.getContractFactory("StarQuest");
  const Oracle = await ethers.getContractFactory("Oracle");
  const HTS = await ethers.getContractFactory("HTS");
  const Consensus = await ethers.getContractFactory("Consensus");
  const Filecoin = await ethers.getContractFactory("Filecoin");

  // Deploy contracts
  console.log("📦 Deploying StarQuest contract...");
  const starQuest = await StarQuest.deploy();
  await starQuest.waitForDeployment();
  const starQuestAddress = await starQuest.getAddress();
  console.log(`✅ StarQuest deployed to: ${starQuestAddress}`);

  console.log("🔮 Deploying Oracle contract...");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`✅ Oracle deployed to: ${oracleAddress}`);

  console.log("🪙 Deploying HTS contract...");
  const hts = await HTS.deploy();
  await hts.waitForDeployment();
  const htsAddress = await hts.getAddress();
  console.log(`✅ HTS deployed to: ${htsAddress}`);

  console.log("🤝 Deploying Consensus contract...");
  const consensus = await Consensus.deploy();
  await consensus.waitForDeployment();
  const consensusAddress = await consensus.getAddress();
  console.log(`✅ Consensus deployed to: ${consensusAddress}`);

  console.log("💾 Deploying Filecoin contract...");
  const filecoin = await Filecoin.deploy();
  await filecoin.waitForDeployment();
  const filecoinAddress = await filecoin.getAddress();
  console.log(`✅ Filecoin deployed to: ${filecoinAddress}`);

  // Create some initial stars
  console.log("🌟 Creating initial stars...");
  
  const stars = [
    {
      name: "Cosmic Dawn",
      description: "A brilliant star that marks the beginning of your journey",
      rarity: 1,
      starType: 1,
      experienceReward: 100,
      tokenReward: ethers.parseEther("10"),
      metadataURI: "https://api.starquest.com/metadata/stars/1"
    },
    {
      name: "Elemental Fire",
      description: "A star burning with the power of fire",
      rarity: 2,
      starType: 2,
      experienceReward: 200,
      tokenReward: ethers.parseEther("25"),
      metadataURI: "https://api.starquest.com/metadata/stars/2"
    }
  ];

  for (const star of stars) {
    const tx = await starQuest.createStar(
      star.name,
      star.description,
      star.rarity,
      star.starType,
      star.experienceReward,
      star.tokenReward,
      star.metadataURI
    );
    await tx.wait();
    console.log(`✅ Created star: ${star.name}`);
  }

  // Display deployment summary
  console.log("\n🎉 Hedera Testnet Deployment Summary:");
  console.log("=====================================");
  console.log(`StarQuest Contract: ${starQuestAddress}`);
  console.log(`Oracle Contract: ${oracleAddress}`);
  console.log(`HTS Contract: ${htsAddress}`);
  console.log(`Consensus Contract: ${consensusAddress}`);
  console.log(`Filecoin Contract: ${filecoinAddress}`);
  console.log(`Network: Hedera Testnet`);
  console.log(`Chain ID: 296`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "hedera_testnet",
    chainId: 296,
    contracts: {
      StarQuest: starQuestAddress,
      Oracle: oracleAddress,
      HTS: htsAddress,
      Consensus: consensusAddress,
      Filecoin: filecoinAddress
    },
    deployer: await ethers.provider.getSigner().getAddress(),
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    './hedera-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to hedera-deployment.json");
  console.log("\n🔗 Next steps:");
  console.log("1. Update your mobile app with the contract addresses");
  console.log("2. Test the contracts on Hedera testnet");
  console.log("3. Start testing the application!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
```

## 🔧 **Step 5: Update Package.json Scripts**

### **Add Hedera deployment scripts:**
```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.ts",
    "deploy:hedera": "hardhat run scripts/deploy-hedera.ts --network hedera_testnet",
    "deploy:hedera-mainnet": "hardhat run scripts/deploy-hedera.ts --network hedera_mainnet",
    "verify": "hardhat verify",
    "coverage": "hardhat coverage",
    "gas-report": "REPORT_GAS=true hardhat test"
  }
}
```

## 🚀 **Step 6: Deploy to Hedera Testnet**

### **Compile Contracts:**
```bash
npm run compile
```

### **Deploy to Hedera Testnet:**
```bash
npm run deploy:hedera
```

## 🔧 **Step 7: Update Mobile App Configuration**

### **Update mobile app with Hedera addresses:**
```typescript
// mobile/src/config/environment.ts
export const config = {
  API_BASE_URL: 'http://localhost:3000',
  BLOCKCHAIN_NETWORK: 'hedera-testnet',
  HEDERA_NETWORK: 'testnet',
  CONTRACT_ADDRESSES: {
    StarQuest: '0x...', // Your deployed contract address
    Oracle: '0x...',
    HTS: '0x...',
    Consensus: '0x...',
    Filecoin: '0x...'
  },
  WALLET_PRIVATE_KEY: 'your-private-key'
};
```

## 🎯 **Step 8: Test the Deployment**

### **Test Contract Interaction:**
```bash
# Test basic contract functions
npm run test

# Test on Hedera testnet
npm run deploy:hedera
```

### **Verify Contracts:**
```bash
# Check contract addresses
cat hedera-deployment.json
```

## 🎉 **Success Checklist**

### **✅ Hedera Testnet Deployment:**
- [ ] Hedera dependencies installed
- [ ] Hardhat configured for Hedera
- [ ] Environment variables set
- [ ] Contracts compiled successfully
- [ ] Deployment script created
- [ ] Contracts deployed to Hedera testnet
- [ ] Contract addresses saved
- [ ] Mobile app updated with addresses

## 🚀 **Quick Start Commands**

```bash
# Complete Hedera deployment setup
cd starquest-ar/contracts

# Install dependencies
npm install @hashgraph/sdk @hashgraph/hardhat-plugin

# Create environment file
echo "HEDERA_PRIVATE_KEY=your_private_key_here" > .env
echo "HEDERA_ACCOUNT_ID=your_account_id_here" >> .env

# Compile contracts
npm run compile

# Deploy to Hedera testnet
npm run deploy:hedera
```

## 📞 **Need Help?**

If you encounter any issues:
1. **Check Hedera account** has sufficient HBAR
2. **Verify private key** format
3. **Ensure network** configuration is correct
4. **Check contract** compilation errors
5. **Review deployment** logs

**Your StarQuest AR project is now ready for Hedera testnet!** 🎉
