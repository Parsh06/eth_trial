// Basic usage example for StarQuest integration
import { StarQuestClient, STAR_TYPES } from '../lib/starquest-client.js';
import dotenv from 'dotenv';

dotenv.config();

async function basicUsage() {
  console.log("🌟 StarQuest Basic Usage Example");
  console.log("=================================");
  console.log("Using LIVE contracts on Hedera Testnet!");

  try {
    // Initialize client with testnet (uses deployed contract addresses)
    const client = new StarQuestClient({
      network: 'testnet',
      privateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY
    });

    console.log("\n📍 Contract Addresses:");
    console.log("StarQuest Core:  0xBE37915340633f6E417EdE7Af996bE073eA269fE");
    console.log("Oracle:          0x47daD15949705f42727cAeCBC81ed89BEDD16e9d");
    console.log("HTS:             0x41F4867b62DE16cfEFF1cf22392ca3396A07F27e");
    console.log("Consensus:       0xFBe6F19d8682bfD1E5e74372C2441FC0C94B650d");
    console.log("Filecoin:        0xA7aC16Cf90f841EaC695f337CB4d60637a673EF4");

    // Example 1: Get all active stars
    console.log("\n⭐ Getting all stars...");
    const stars = await client.getAllStars();
    
    if (stars.length > 0) {
      console.log(`✅ Found ${stars.length} active stars:`);
      stars.forEach((star, index) => {
        const typeNames = ['Common', 'Rare', 'Epic', 'Legendary'];
        console.log(`  ${index}: ${typeNames[star.starType]} at (${star.latitude}, ${star.longitude}) - ${star.basePayout} HBAR`);
      });
    } else {
      console.log("❌ No stars found");
    }

    // Example 2: Get specific star details
    if (stars.length > 0) {
      console.log(`\n🎯 Getting details for star 0...`);
      const star = await client.getStar(0);
      console.log(`Star Type: ${star.starType}`);
      console.log(`Location: ${star.latitude}, ${star.longitude}`);
      console.log(`Base Payout: ${star.basePayout} HBAR`);
      console.log(`Active Stakes: ${star.totalStakes}`);
    }

    // Example 3: Get player statistics
    console.log("\n👤 Getting player stats...");
    const stats = await client.getPlayerStats();
    console.log(`Total Staked: ${stats.totalStaked} HBAR`);
    console.log(`Active Stakes: ${stats.activeStakes}`);
    console.log(`Total Winnings: ${stats.totalWinnings} HBAR`);
    console.log(`Games Played: ${stats.gamesPlayed}`);

    // Example 4: Check contract status
    console.log("\n📊 Contract status...");
    const contractStats = await client.getContractStats();
    console.log(`Total Stars: ${contractStats.totalStars}`);
    console.log(`Total Players: ${contractStats.activePlayers}`);
    console.log(`Contract Paused: ${contractStats.isPaused ? 'Yes' : 'No'}`);

    console.log("\n✅ Basic usage example completed successfully!");
    console.log("\n🎯 Next steps:");
    console.log("- Run 'node examples/gameplay-example.js' for gameplay features");
    console.log("- Run 'node examples/admin-example.js' for admin functions");
    console.log("- Check CONTRACTS.md for all deployed addresses");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure your .env file has HEDERA_OPERATOR_PRIVATE_KEY");
    console.log("2. Check that you have testnet HBAR in your account");
    console.log("3. Verify network connectivity");
  }
}

// Run the example
basicUsage();