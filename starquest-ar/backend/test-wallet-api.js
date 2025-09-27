const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_WALLET = '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4';
let authToken = null;

// Mock authentication (simplified for testing)
async function authenticateUser() {
  try {
    console.log('🔐 Authenticating test user...');
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/wallet-login`, {
      walletAddress: TEST_WALLET,
      signature: 'mock-signature',
      message: 'mock-message'
    });
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('✅ Authentication successful');
      return response.data;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.response?.data || error.message);
    throw error;
  }
}

// Test wallet collection endpoint
async function testWalletCollection() {
  try {
    console.log('📋 Testing wallet collection endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/api/wallet/collection`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Collection data received:');
    console.log(`   Total NFTs: ${response.data.data.total}`);
    console.log(`   NFTs in response: ${response.data.data.nfts.length}`);
    console.log(`   Total value: ${response.data.data.statistics.totalValue}`);
    console.log(`   Rarity breakdown:`, response.data.data.statistics.rarityBreakdown);
    
    return response.data;
  } catch (error) {
    console.error('❌ Collection test error:', error.response?.data || error.message);
    throw error;
  }
}

// Test wallet summary endpoint
async function testWalletSummary() {
  try {
    console.log('📊 Testing wallet summary endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/api/wallet/summary`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Summary data received:');
    console.log(`   Total NFTs: ${response.data.data.totalNFTs}`);
    console.log(`   Total value: ${response.data.data.totalValue}`);
    console.log(`   Top NFTs: ${response.data.data.topNFTs.length}`);
    console.log(`   Recent activities: ${response.data.data.recentActivity.length}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Summary test error:', error.response?.data || error.message);
    throw error;
  }
}

// Test wallet info endpoint
async function testWalletInfo() {
  try {
    console.log('💰 Testing wallet info endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/api/wallet/info`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Wallet info received:');
    console.log(`   Balance: ${response.data.data.balance} ETH`);
    console.log(`   Connected: ${response.data.data.isConnected}`);
    console.log(`   Network:`, response.data.data.network?.name || 'Unknown');
    
    return response.data;
  } catch (error) {
    console.error('❌ Wallet info test error:', error.response?.data || error.message);
    throw error;
  }
}

// Test NFT details endpoint
async function testNFTDetails() {
  try {
    console.log('🖼️  Testing NFT details endpoint...');
    
    const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const tokenId = '1001';
    
    const response = await axios.get(`${API_BASE_URL}/api/wallet/nft/${contractAddress}/${tokenId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ NFT details received:');
    console.log(`   Name: ${response.data.data.name}`);
    console.log(`   Rarity: ${response.data.data.rarity}`);
    console.log(`   Views: ${response.data.data.stats.views}`);
    console.log(`   Likes: ${response.data.data.stats.likes}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ NFT details test error:', error.response?.data || error.message);
    throw error;
  }
}

// Test health check endpoint
async function testHealthCheck() {
  try {
    console.log('🏥 Testing health check...');
    
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    
    console.log('✅ Health check passed:');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Database: ${response.data.services.database}`);
    console.log(`   Web3: ${response.data.services.web3}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Health check error:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting StarQuest Wallet API Tests\\n');
  
  try {
    // Test 1: Health check
    await testHealthCheck();
    console.log('');
    
    // Test 2: Authentication
    await authenticateUser();
    console.log('');
    
    // Test 3: Wallet collection
    await testWalletCollection();
    console.log('');
    
    // Test 4: Wallet summary
    await testWalletSummary();
    console.log('');
    
    // Test 5: Wallet info
    await testWalletInfo();
    console.log('');
    
    // Test 6: NFT details
    await testNFTDetails();
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    console.log('\\n📋 Test Summary:');
    console.log('   ✅ Health Check');
    console.log('   ✅ Authentication');
    console.log('   ✅ Wallet Collection');
    console.log('   ✅ Wallet Summary');
    console.log('   ✅ Wallet Info');
    console.log('   ✅ NFT Details');
    
  } catch (error) {
    console.log('\\n❌ Test suite failed!');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

// Instructions for running
if (require.main === module) {
  console.log('📝 Instructions:');
  console.log('   1. Make sure the backend server is running: npm run dev');
  console.log('   2. Run the seeder: npx ts-node backend/seeders/wallet-collection-seeder.ts');
  console.log('   3. Run this test: node backend/test-wallet-api.js\\n');
  
  runTests();
}
