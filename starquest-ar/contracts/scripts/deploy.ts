import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StarQuest contracts...");

  // Get the contract factories
  const StarQuestToken = await ethers.getContractFactory("StarQuestToken");
  const StarQuest = await ethers.getContractFactory("StarQuest");

  // Deploy StarQuest Token first
  console.log("📦 Deploying StarQuest Token...");
  const starQuestToken = await StarQuestToken.deploy();
  await starQuestToken.waitForDeployment();
  const tokenAddress = await starQuestToken.getAddress();
  console.log(`✅ StarQuest Token deployed to: ${tokenAddress}`);

  // Deploy main StarQuest contract
  console.log("⭐ Deploying StarQuest contract...");
  const starQuest = await StarQuest.deploy(tokenAddress);
  await starQuest.waitForDeployment();
  const contractAddress = await starQuest.getAddress();
  console.log(`✅ StarQuest contract deployed to: ${contractAddress}`);

  // Mint initial tokens to the contract
  console.log("💰 Minting initial tokens...");
  const mintAmount = ethers.parseEther("1000000"); // 1M tokens
  await starQuestToken.mint(contractAddress, mintAmount);
  console.log(`✅ Minted ${ethers.formatEther(mintAmount)} tokens to contract`);

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
    },
    {
      name: "Mystical Crystal",
      description: "A rare crystal star with mysterious properties",
      rarity: 3,
      starType: 5,
      experienceReward: 500,
      tokenReward: ethers.parseEther("100"),
      metadataURI: "https://api.starquest.com/metadata/stars/3"
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
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log(`StarQuest Token: ${tokenAddress}`);
  console.log(`StarQuest Contract: ${contractAddress}`);
  console.log(`Network: ${await ethers.provider.getNetwork().then(n => n.name)}`);
  console.log(`Chain ID: ${await ethers.provider.getNetwork().then(n => n.chainId)}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    chainId: await ethers.provider.getNetwork().then(n => n.chainId),
    tokenAddress,
    contractAddress,
    deployer: await ethers.provider.getSigner().getAddress(),
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    './deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment.json");
  console.log("\n🔗 Next steps:");
  console.log("1. Update your frontend with the contract addresses");
  console.log("2. Verify contracts on block explorer (optional)");
  console.log("3. Start testing the application!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

