# StarQuest Contract Configuration

## 🚀 Deployed Contracts (Hedera Testnet)

All StarQuest contracts are **LIVE** and ready to use on Hedera Testnet!

### Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| **StarQuest Core** | `0xBE37915340633f6E417EdE7Af996bE073eA269fE` | Main game logic, staking, challenges |
| **StarQuest Oracle** | `0x47daD15949705f42727cAeCBC81ed89BEDD16e9d` | AI verification, external data feeds |
| **StarQuest HTS** | `0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e` | Token management, rewards, NFTs |
| **StarQuest Consensus** | `0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d` | Immutable logging, consensus |
| **StarQuest Filecoin** | `0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4` | Decentralized storage |

### Network Configuration

- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC URL**: `https://testnet.hashio.io/api`
- **Explorer**: `https://hashscan.io/testnet`

### Contract Owner

- **Address**: `0xDb5eAbb1058A384A10EB8E91f5CcDbA293677E60`
- **Role**: Contract administrator and game master

### Game Settings

- **Minimum Stake**: 0.01 HBAR
- **Maximum Stake**: 10.0 HBAR  
- **Win Multiplier**: 200% (2x payout)
- **House Fee**: 5%
- **Contract Status**: Active ✅

### Active Stars (4 Deployed)

| Location | Type | Coordinates | Radius | Base Payout |
|----------|------|-------------|--------|-------------|
| **Times Square, NYC** | Rare | 40.7580, -73.9855 | 100m | 0.1 HBAR |
| **Eiffel Tower, Paris** | Epic | 48.8584, 2.2945 | 200m | 0.2 HBAR |
| **Central Park, NYC** | Common | 40.7694, -73.9732 | 50m | 0.05 HBAR |
| **Tokyo Tower, Japan** | Legendary | 35.6586, 139.7454 | 300m | 0.5 HBAR |

### Contract Verification

All contracts are verified and open source:

1. **View on HashScan**: Navigate to each address above on `https://hashscan.io/testnet/contract/[address]`
2. **Source Code**: Available in the `/contracts` folder
3. **ABIs**: Available in the `/abis` folder

### Quick Verification Commands

```bash
# Check contract is deployed
curl -X POST https://testnet.hashio.io/api \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xBE37915340633f6E417EdE7Af996bE073eA269fE","latest"],"id":1}'

# Get current star count
node -e "
import('./lib/starquest-client.js').then(async ({ StarQuestClient }) => {
  const client = new StarQuestClient({ network: 'testnet' });
  const stars = await client.getAllStars();
  console.log(\`Active stars: \${stars.length}\`);
});
"
```

### Environment Setup

Copy these exact values to your `.env` file:

```env
# Hedera Account (Add your private key)
HEDERA_OPERATOR_PRIVATE_KEY=your_private_key_here
HEDERA_OPERATOR_ID=0.0.youraccountid

# Network
NETWORK=testnet

# Contract Addresses (LIVE - Ready to Use)
STARQUEST_CONTRACT_ADDRESS=0xBE37915340633f6E417EdE7Af996bE073eA269fE
ORACLE_CONTRACT_ADDRESS=0x47daD15949705f42727cAeCBC81ed89BEDD16e9d
HTS_CONTRACT_ADDRESS=0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e
CONSENSUS_CONTRACT_ADDRESS=0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d
FILECOIN_CONTRACT_ADDRESS=0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4
```

### Integration Ready!

✅ **All contracts deployed and functional**  
✅ **4 sample stars active worldwide**  
✅ **Full integration library available**  
✅ **Complete documentation provided**  
✅ **Examples and test suite included**  

**🎯 Ready to build amazing AR treasure hunting experiences!**