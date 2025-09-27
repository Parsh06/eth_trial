// Gameplay example for StarQuest integration
import { StarQuestClient, STAR_TYPES } from '../lib/starquest-client.js';
import dotenv from 'dotenv';

dotenv.config();

async function gameplayExample() {
  console.log("🎯 StarQuest Gameplay Example");
  console.log("==============================");

  try {
    const client = new StarQuestClient({
      network: 'testnet',
      privateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY
    });

    // Example 1: Create a stake
    console.log("\n💰 Creating a stake...");
    const stakeResult = await client.createStake(0, "0.05"); // Stake 0.05 HBAR on star 0
    
    if (stakeResult.success) {
      console.log("✅ Stake created successfully!");
      console.log(`Transaction: ${stakeResult.transaction.hash}`);
      
      // Get updated player stats
      const stats = await client.getPlayerStats();
      console.log(`Total Staked: ${stats.totalStaked} HBAR`);
    } else {
      console.log(`❌ Stake creation failed: ${stakeResult.error}`);
    }

    // Example 2: Complete a challenge (mock)
    console.log("\n🏆 Simulating challenge completion...");
    // In a real game, this would be called after AR challenge verification
    // const completeResult = await client.completeChallenge(1, true, "ar_proof_hash_123");

    // Example 3: Event listening
    console.log("\n🎧 Setting up event listeners...");
    client.startEventListening({
      onStaked: (event) => {
        console.log(`🎯 New Stake: ${event.player} staked ${event.amount} HBAR`);
      },
      onChallengeCompleted: (event) => {
        console.log(`🏆 Challenge Complete: ${event.success ? 'Success' : 'Failed'}, Payout: ${event.payout} HBAR`);
      },
      onStarAdded: (event) => {
        console.log(`⭐ New Star: ${event.starType} at (${event.latitude}, ${event.longitude})`);
      }
    });

    console.log("✅ Event listeners active. Press Ctrl+C to stop.");

    // Keep the script running to listen for events
    process.on('SIGINT', () => {
      console.log("\n🛑 Stopping event listeners...");
      client.stopEventListening();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run example
gameplayExample();