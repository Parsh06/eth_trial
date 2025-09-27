// Admin example for StarQuest integration
import { StarQuestClient, STAR_TYPES } from '../lib/starquest-client.js';
import dotenv from 'dotenv';

dotenv.config();

async function adminExample() {
  console.log("🔧 StarQuest Admin Example");
  console.log("===========================");

  try {
    // Initialize client with admin private key
    const client = new StarQuestClient({
      network: 'testnet',
      privateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY
    });

    // Example 1: Add a new star
    console.log("\n⭐ Adding a new star...");
    const starResult = await client.addStar(
      40.7589, // Latitude (NYC area)
      -73.9851, // Longitude 
      STAR_TYPES.RARE, // Star type
      "0.1" // Base payout in HBAR
    );

    if (starResult.success) {
      console.log("✅ Star added successfully!");
      console.log(`Star ID: ${starResult.starId}`);
      console.log(`Transaction: ${starResult.transaction.hash}`);
    } else {
      console.log(`❌ Star addition failed: ${starResult.error}`);
    }

    // Example 2: Pause the contract (emergency)
    console.log("\n⏸️ Pausing contract...");
    const pauseResult = await client.pauseContract();
    
    if (pauseResult.success) {
      console.log("✅ Contract paused successfully!");
      console.log(`Transaction: ${pauseResult.transaction.hash}`);
    } else {
      console.log(`❌ Pause failed: ${pauseResult.error}`);
    }

    // Example 3: Unpause the contract
    console.log("\n▶️ Unpausing contract...");
    const unpauseResult = await client.unpauseContract();
    
    if (unpauseResult.success) {
      console.log("✅ Contract unpaused successfully!");
      console.log(`Transaction: ${unpauseResult.transaction.hash}`);
    } else {
      console.log(`❌ Unpause failed: ${unpauseResult.error}`);
    }

    // Example 4: Bulk add stars
    console.log("\n📦 Bulk adding stars...");
    const bulkStars = [
      {
        latitude: 34.0522,
        longitude: -118.2437,
        starType: STAR_TYPES.COMMON,
        basePayout: "0.05"
      },
      {
        latitude: 41.8781,
        longitude: -87.6298,
        starType: STAR_TYPES.UNCOMMON,
        basePayout: "0.08"
      },
      {
        latitude: 29.7604,
        longitude: -95.3698,
        starType: STAR_TYPES.RARE,
        basePayout: "0.12"
      }
    ];

    const bulkResult = await client.bulkAddStars(bulkStars);
    console.log(`✅ Bulk operation completed: ${bulkResult.successful}/${bulkResult.total} stars added`);

    if (bulkResult.failed.length > 0) {
      console.log("❌ Failed stars:");
      bulkResult.failed.forEach(failure => {
        console.log(`  - Star ${failure.index}: ${failure.error}`);
      });
    }

    // Example 5: Get contract statistics
    console.log("\n📊 Contract Statistics:");
    const stats = await client.getContractStats();
    console.log(`Total Stars: ${stats.totalStars}`);
    console.log(`Active Players: ${stats.activePlayers}`);
    console.log(`Total Volume: ${stats.totalVolume} HBAR`);
    console.log(`Contract Paused: ${stats.isPaused}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run example
adminExample();