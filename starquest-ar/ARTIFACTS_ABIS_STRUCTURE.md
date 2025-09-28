# 📁 Artifacts & ABIs - Complete Structure & Usage Guide

## 🎯 **Folder Structure Overview**

```
starquest-ar/
├── 📦 contracts/
│   ├── artifacts/                    # 🔧 COMPILED CONTRACTS
│   │   ├── build-info/              # Build metadata
│   │   │   ├── 0bca88e0d51d2243889b41040db95d90.json
│   │   │   ├── 3b01e7105dbc7cac53975e69a5f2dbb2.json
│   │   │   ├── 56cb01005514fc0926c36d378efd4eeb.json
│   │   │   ├── 86e254946f93bdc988e2a29479df8eed.json
│   │   │   └── fa1fdac3b753a37e0bb7c74bcf805590.json
│   │   ├── StarQuest.json           # Main contract artifact
│   │   ├── StarQuest_metadata.json  # Contract metadata
│   │   ├── StarQuestHTS.json        # HTS contract artifact
│   │   ├── StarQuestHTS_metadata.json
│   │   ├── StarQuestOracle.json     # Oracle contract artifact
│   │   ├── StarQuestOracle_metadata.json
│   │   ├── StarQuestConsensusService.json
│   │   ├── StarQuestConsensusService_metadata.json
│   │   ├── StarQuestFilecoinStorage.json
│   │   ├── StarQuestFilecoinStorage_metadata.json
│   │   ├── IHederaTokenService.json # Hedera service interface
│   │   ├── IHederaTokenService_metadata.json
│   │   ├── IHTS.json                # HTS interface
│   │   └── IHTS_metadata.json
│   ├── contracts/                   # 📝 SOURCE CONTRACTS
│   │   ├── Core.sol                 # Main staking contract
│   │   ├── Oracle.sol               # Price feeds & location
│   │   ├── HTS.sol                  # Hedera Token Service
│   │   ├── Consensus.sol            # Game consensus
│   │   └── Filecoin.sol             # Filecoin storage
│   └── scripts/
│       └── deploy.ts                # Deployment script
│
└── 📱 mobile/src/abis/              # 📱 MOBILE APP ABIs
    ├── StarQuest.json               # Main contract ABI
    ├── StarQuestConsensusService.json
    ├── StarQuestFilecoinStorage.json
    ├── StarQuestHTS.json            # HTS contract ABI
    └── StarQuestOracle.json         # Oracle contract ABI
```

## 🔧 **Artifacts vs ABIs - Key Differences**

### **📦 Artifacts (contracts/artifacts/)**
**Purpose**: Complete compiled contract information for deployment
**Contains**:
- ✅ **Bytecode** - Deployable contract code
- ✅ **ABI** - Application Binary Interface
- ✅ **Metadata** - Source code, compiler info
- ✅ **Build Info** - Compilation details
- ✅ **Deployment Data** - Network-specific info

### **📱 ABIs (mobile/src/abis/)**
**Purpose**: Interface definitions for mobile app interaction
**Contains**:
- ✅ **ABI Only** - Function signatures and events
- ✅ **No Bytecode** - Not needed for interaction
- ✅ **Optimized** - Smaller file size for mobile
- ✅ **Mobile-Ready** - Formatted for React Native

## 🎯 **Detailed File Structure & Usage**

### **🔧 Artifacts Structure (contracts/artifacts/)**

```
artifacts/
├── 📊 build-info/                   # Build metadata
│   ├── 0bca88e0d51d2243889b41040db95d90.json
│   ├── 3b01e7105dbc7cac53975e69a5f2dbb2.json
│   ├── 56cb01005514fc0926c36d378efd4eeb.json
│   ├── 86e254946f93bdc988e2a29479df8eed.json
│   └── fa1fdac3b753a37e0bb7c74bcf805590.json
│
├── 🎯 StarQuest.json               # Main contract artifact
│   ├── bytecode                    # Deployable contract code
│   ├── abi                        # Function interfaces
│   ├── deployedBytecode           # Runtime bytecode
│   └── metadata                   # Source code references
│
├── 🎯 StarQuest_metadata.json      # Contract metadata
│   ├── compiler                   # Solidity compiler info
│   ├── language                   # Solidity version
│   ├── sources                    # Source file mappings
│   └── settings                   # Compilation settings
│
├── 🔗 StarQuestHTS.json            # HTS contract artifact
├── 🔗 StarQuestOracle.json         # Oracle contract artifact
├── 🔗 StarQuestConsensusService.json
├── 🔗 StarQuestFilecoinStorage.json
├── 🔗 IHederaTokenService.json     # Hedera service interface
└── 🔗 IHTS.json                    # HTS interface
```

### **📱 ABIs Structure (mobile/src/abis/)**

```
mobile/src/abis/
├── 🎯 StarQuest.json               # Main contract ABI
│   ├── inputs                      # Function parameters
│   ├── outputs                     # Return values
│   ├── stateMutability             # Function type
│   └── type                        # Constructor/function/event
│
├── 🔗 StarQuestHTS.json            # HTS contract ABI
├── 🔗 StarQuestOracle.json         # Oracle contract ABI
├── 🔗 StarQuestConsensusService.json
└── 🔗 StarQuestFilecoinStorage.json
```

## 🚀 **Usage in Your Project**

### **🔧 Artifacts Usage (Backend/Deployment)**

```typescript
// contracts/scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  // Load artifact for deployment
  const StarQuestArtifact = await ethers.getContractFactory("StarQuest");
  
  // Deploy using artifact
  const starQuest = await StarQuestArtifact.deploy(storageWallet);
  await starQuest.waitForDeployment();
  
  console.log("StarQuest deployed to:", await starQuest.getAddress());
}
```

### **📱 ABIs Usage (Mobile App)**

```typescript
// mobile/src/services/StarQuestWeb3Service.ts
import StarQuestABI from '../abis/StarQuest.json';

class StarQuestWeb3Service {
  private contract: ethers.Contract;
  
  constructor() {
    // Use ABI for contract interaction
    this.contract = new ethers.Contract(
      contractAddress,
      StarQuestABI,
      provider
    );
  }
  
  async createStake(starId: number, amount: string) {
    // Call contract function using ABI
    const tx = await this.contract.createStake(starId, {
      value: ethers.parseEther(amount)
    });
    return tx;
  }
}
```

## 🎯 **Key Functions in Each File**

### **🎯 StarQuest.json (Main Contract)**
```json
{
  "createStake": "Stake cryptocurrency for challenge",
  "completeChallenge": "Complete game challenge",
  "withdrawWinnings": "Withdraw player winnings",
  "getPlayerStats": "Get player statistics",
  "addStar": "Add new star location",
  "updateStar": "Update star information"
}
```

### **🔗 StarQuestHTS.json (Hedera Token Service)**
```json
{
  "createFungibleToken": "Create new token",
  "mintToken": "Mint tokens to player",
  "burnToken": "Burn player tokens",
  "transferToken": "Transfer tokens between players"
}
```

### **🔗 StarQuestOracle.json (Price Feeds)**
```json
{
  "getLatestPrice": "Get current token price",
  "updatePrice": "Update price feed",
  "verifyLocation": "Verify player location",
  "getLocationData": "Get location information"
}
```

## 📊 **File Size Comparison**

| File Type | Size | Purpose |
|-----------|------|---------|
| **Artifacts** | ~25MB | Complete deployment info |
| **ABIs** | ~50KB | Mobile app interaction |
| **Build Info** | ~5MB | Compilation metadata |

## 🎯 **Best Practices**

### **✅ Artifacts (contracts/artifacts/)**
- Keep for deployment and verification
- Include in version control
- Use for contract verification on block explorers
- Contains complete contract information

### **✅ ABIs (mobile/src/abis/)**
- Optimize for mobile app size
- Include only necessary functions
- Update when contracts change
- Use for frontend interaction only

## 🚀 **Integration Flow**

```
1. 📝 Write Solidity contracts (contracts/contracts/)
2. 🔧 Compile to artifacts (contracts/artifacts/)
3. 🚀 Deploy using artifacts (scripts/deploy.ts)
4. 📱 Copy ABIs to mobile app (mobile/src/abis/)
5. 🔗 Use ABIs in Web3 service (StarQuestWeb3Service.ts)
6. 🎮 Interact with contracts from mobile app
```

## 🎯 **Your Project Structure is Perfect!**

### **✅ What You Have:**
- **Complete artifacts** for deployment
- **Optimized ABIs** for mobile interaction
- **Proper separation** of concerns
- **Professional organization**

### **✅ Benefits:**
- **Easy deployment** with complete artifacts
- **Fast mobile app** with optimized ABIs
- **Clear separation** between deployment and interaction
- **Scalable architecture** for team development

**Your artifacts and ABIs structure follows Web3 best practices perfectly!** 🎉
