# StarQuest Integration Package

A comprehensive JavaScript integration library for interacting with StarQuest smart contracts on the Hedera network.

## Overview

StarQuest is a blockchain-powered AR treasure hunting game where players stake HBAR on virtual stars and complete real-world challenges to earn rewards. This integration package provides everything needed to build applications on top of the StarQuest protocol.

## Features

- 🎯 **Complete Contract Integration**: Interact with all StarQuest smart contracts
- 🌟 **Star Management**: Add, query, and manage virtual stars
- 💰 **Staking System**: Create stakes and manage player investments  
- 🏆 **Challenge System**: Complete AR challenges and claim rewards
- 🎧 **Real-time Events**: Listen to blockchain events for live updates
- 📦 **Bulk Operations**: Efficient batch operations for admin tasks
- 🔒 **Security**: Built-in input validation and error handling

## Installation

1. **Clone or download this integration package**:
```bash
git clone <your-repo-url>
cd starquest-integration
```

2. **Install dependencies**:
```bash
npm install ethers dotenv
```

3. **Configure environment**:
Create a `.env` file in your project root:
```env
# Hedera Account Configuration
HEDERA_OPERATOR_PRIVATE_KEY=your_private_key_here
HEDERA_OPERATOR_ID=0.0.youraccountid

# Network Configuration (testnet/mainnet)
NETWORK=testnet

# Contract Addresses (Hedera Testnet - Ready to Use!)
STARQUEST_CONTRACT_ADDRESS=0xBE37915340633f6E417EdE7Af996bE073eA269fE
ORACLE_CONTRACT_ADDRESS=0x47daD15949705f42727cAeCBC81ed89BEDD16e9d
HTS_CONTRACT_ADDRESS=0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e
CONSENSUS_CONTRACT_ADDRESS=0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d
FILECOIN_CONTRACT_ADDRESS=0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4
```

## Quick Start

### Basic Usage

```javascript
import { StarQuestClient, STAR_TYPES } from './lib/starquest-client.js';

// Initialize client
const client = new StarQuestClient({
  network: 'testnet',
  privateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY
});

// Get all stars
const stars = await client.getAllStars();
console.log(`Found ${stars.length} stars`);

// Create a stake
const stakeResult = await client.createStake(0, "0.1"); // Stake 0.1 HBAR on star 0
if (stakeResult.success) {
  console.log("Stake created successfully!");
}

// Get player statistics
const stats = await client.getPlayerStats();
console.log(`Total staked: ${stats.totalStaked} HBAR`);
```

### Event Listening

```javascript
// Listen for real-time events
client.startEventListening({
  onStaked: (event) => {
    console.log(`New stake: ${event.amount} HBAR by ${event.player}`);
  },
  onChallengeCompleted: (event) => {
    console.log(`Challenge completed: ${event.success ? 'Success' : 'Failed'}`);
  },
  onStarAdded: (event) => {
    console.log(`New star added: ${event.starType}`);
  }
});
```

## Contract Architecture

The StarQuest ecosystem consists of 5 smart contracts:

### 1. **StarQuest Core** (`StarQuest.sol`)
- **Purpose**: Main game logic and state management
- **Key Functions**: Staking, challenge completion, reward distribution
- **Events**: `Staked`, `ChallengeCompleted`, `RewardPaid`

### 2. **StarQuest Oracle** (`StarQuestOracle.sol`) 
- **Purpose**: External data feeds and AR challenge verification
- **Key Functions**: Challenge validation, location verification
- **Events**: `ChallengeValidated`, `LocationVerified`

### 3. **StarQuest HTS** (`StarQuestHTS.sol`)
- **Purpose**: Hedera Token Service integration for rewards
- **Key Functions**: Token minting, distribution, governance
- **Events**: `TokenMinted`, `RewardDistributed`

### 4. **StarQuest Consensus** (`StarQuestConsensusService.sol`)
- **Purpose**: Decentralized consensus for challenge verification
- **Key Functions**: Multi-oracle validation, dispute resolution
- **Events**: `ConsensusReached`, `DisputeResolved`

### 5. **StarQuest Filecoin Storage** (`StarQuestFilecoinStorage.sol`)
- **Purpose**: Decentralized storage for AR proofs and metadata
- **Key Functions**: File storage, retrieval, verification
- **Events**: `FileStored`, `FileRetrieved`

## API Reference

### StarQuestClient Class

#### Constructor
```javascript
new StarQuestClient(config)
```
- `config.network`: 'testnet' | 'mainnet'  
- `config.privateKey`: Hedera private key
- `config.customRPC`: Custom RPC endpoint (optional)

#### Star Management
```javascript
// Get all stars
await client.getAllStars()

// Get specific star
await client.getStar(starId)

// Add new star (admin only)
await client.addStar(latitude, longitude, starType, basePayout)

// Bulk add stars (admin only)
await client.bulkAddStars(starsArray)
```

#### Staking & Gameplay
```javascript
// Create stake
await client.createStake(starId, amount)

// Complete challenge
await client.completeChallenge(starId, success, proof)

// Get player stats
await client.getPlayerStats(address)

// Get star stakes
await client.getStarStakes(starId)
```

#### Contract Management
```javascript
// Pause contract (admin only)
await client.pauseContract()

// Unpause contract (admin only)
await client.unpauseContract()

// Get contract stats
await client.getContractStats()
```

#### Event Listening
```javascript
// Start listening
client.startEventListening(callbacks)

// Stop listening
client.stopEventListening()
```

### Constants

```javascript
// Star Types
STAR_TYPES = {
  COMMON: 0,
  UNCOMMON: 1, 
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4
}

// Network Endpoints
NETWORKS = {
  testnet: 'https://testnet.hashio.io/api',
  mainnet: 'https://mainnet.hashio.io/api'
}
```

## Examples

Explore the `examples/` directory for complete usage examples:

- **`basic-usage.js`**: Getting started with core functionality
- **`gameplay-example.js`**: Player interactions and event listening
- **`admin-example.js`**: Administrative functions and bulk operations

### Running Examples

```bash
# Basic usage example
node examples/basic-usage.js

# Gameplay example with event listening
node examples/gameplay-example.js

# Admin operations example
node examples/admin-example.js
```

## Error Handling

The client includes comprehensive error handling:

```javascript
try {
  const result = await client.createStake(0, "0.1");
  
  if (result.success) {
    console.log("Success:", result.transaction.hash);
  } else {
    console.log("Error:", result.error);
  }
} catch (error) {
  console.error("Unexpected error:", error.message);
}
```

## Best Practices

### 1. **Environment Security**
- Never commit private keys to version control
- Use environment variables for sensitive configuration
- Consider using hardware wallets for production

### 2. **Error Handling**
- Always check `result.success` before proceeding
- Implement retry logic for network failures  
- Log errors for debugging and monitoring

### 3. **Event Listening**
- Use event listeners for real-time updates
- Implement reconnection logic for websocket failures
- Filter events by relevant addresses to reduce noise

### 4. **Performance**
- Use bulk operations for multiple transactions
- Cache frequently accessed data like star information
- Implement pagination for large data sets

### 5. **Testing**
- Test on testnet before mainnet deployment
- Use small amounts for initial testing
- Validate all inputs before sending transactions

## Development

### Project Structure
```
starquest-integration/
├── lib/
│   └── starquest-client.js    # Main client library
├── abis/                      # Contract ABIs
│   ├── StarQuest.json
│   ├── StarQuestOracle.json
│   ├── StarQuestHTS.json
│   ├── StarQuestConsensusService.json
│   └── StarQuestFilecoinStorage.json
├── examples/                  # Usage examples
│   ├── basic-usage.js
│   ├── gameplay-example.js
│   └── admin-example.js
└── README.md                  # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For questions and support:
- 📧 Email: support@starquest.game
- 💬 Discord: [StarQuest Community](https://discord.gg/starquest)
- 📖 Documentation: [docs.starquest.game](https://docs.starquest.game)

## License

MIT License - see LICENSE file for details

## Deployed Contract Addresses (Testnet)

**✅ Live on Hedera Testnet - Ready to Use:**

```
StarQuest Core:              0xBE37915340633f6E417EdE7Af996bE073eA269fE
StarQuest Oracle:            0x47daD15949705f42727cAeCBC81ed89BEDD16e9d
StarQuest HTS:               0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e
StarQuest Consensus:         0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d
StarQuest Filecoin:          0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4
```

**🌟 Game Status**: 4 active stars deployed worldwide
- Times Square (Rare) - 100m radius
- Eiffel Tower (Epic) - 200m radius  
- Central Park (Common) - 50m radius
- Tokyo Tower (Legendary) - 300m radius

---

**Ready to build amazing AR treasure hunting experiences on Hedera! 🌟**