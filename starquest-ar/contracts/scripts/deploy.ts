import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StarQuest contracts...");

  // Get the contract factories
  const StarQuest = await ethers.getContractFactory("StarQuest");
  const StarQuestOracle = await ethers.getContractFactory("StarQuestOracle");
  const StarQuestHTS = await ethers.getContractFactory("StarQuestHTS");
  const StarQuestConsensusService = await ethers.getContractFactory("StarQuestConsensusService");
  const StarQuestFilecoinStorage = await ethers.getContractFactory("StarQuestFilecoinStorage");

  // Deploy main StarQuest contract
  console.log("⭐ Deploying StarQuest Core contract...");
  const [deployer] = await ethers.getSigners();
  const storageWallet = deployer.address; // Use deployer as storage wallet for local testing
  const starQuest = await StarQuest.deploy(storageWallet);
  await starQuest.deployed();
  const starQuestAddress = starQuest.address;
  console.log(`✅ StarQuest Core deployed to: ${starQuestAddress}`);

  // Deploy Oracle contract
  console.log("🔮 Deploying StarQuest Oracle contract...");
  const oracle = await StarQuestOracle.deploy();
  await oracle.deployed();
  const oracleAddress = oracle.address;
  console.log(`✅ StarQuest Oracle deployed to: ${oracleAddress}`);

  // Deploy HTS contract
  console.log("🪙 Deploying StarQuest HTS contract...");
  const hts = await StarQuestHTS.deploy();
  await hts.deployed();
  const htsAddress = hts.address;
  console.log(`✅ StarQuest HTS deployed to: ${htsAddress}`);

  // Deploy Consensus contract
  console.log("🤝 Deploying StarQuest Consensus Service contract...");
  const topicId = "0.0.123456"; // Example Hedera topic ID for local testing
  const consensus = await StarQuestConsensusService.deploy(topicId);
  await consensus.deployed();
  const consensusAddress = consensus.address;
  console.log(`✅ StarQuest Consensus Service deployed to: ${consensusAddress}`);

  // Deploy Filecoin contract
  console.log("💾 Deploying StarQuest Filecoin Storage contract...");
  const usdfcAddress = "0x0000000000000000000000000000000000000000"; // Dummy address for local testing
  const filecoin = await StarQuestFilecoinStorage.deploy(usdfcAddress);
  await filecoin.deployed();
  const filecoinAddress = filecoin.address;
  console.log(`✅ StarQuest Filecoin Storage deployed to: ${filecoinAddress}`);

  // Display deployment summary
  console.log("\n🎉 Local Deployment Summary:");
  console.log("=============================");
  console.log(`StarQuest Core: ${starQuestAddress}`);
  console.log(`Oracle: ${oracleAddress}`);
  console.log(`HTS: ${htsAddress}`);
  console.log(`Consensus: ${consensusAddress}`);
  console.log(`Filecoin: ${filecoinAddress}`);
  console.log(`Network: ${await ethers.provider.getNetwork().then(n => n.name)}`);
  console.log(`Chain ID: ${await ethers.provider.getNetwork().then(n => n.chainId)}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    chainId: await ethers.provider.getNetwork().then(n => n.chainId),
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
    './deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment.json");
  console.log("\n🔗 Next steps:");
  console.log("1. Update your mobile app with the contract addresses");
  console.log("2. Start the backend API");
  console.log("3. Start the mobile app and test!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

