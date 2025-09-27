const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing StarQuest Backend...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test wallet login
    console.log('2. Testing wallet login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/wallet-login`, {
      walletAddress: '0x1234567890123456789012345678901234567890',
      signature: 'mock-signature',
      message: 'Connect to StarQuest AR'
    });
    console.log('✅ Wallet login passed:', loginResponse.data);
    console.log('');

    // Test getting stars
    console.log('3. Testing get stars...');
    const starsResponse = await axios.get(`${BASE_URL}/star`);
    console.log('✅ Get stars passed:', starsResponse.data);
    console.log('');

    // Test getting quests
    console.log('4. Testing get quests...');
    const questsResponse = await axios.get(`${BASE_URL}/quest`);
    console.log('✅ Get quests passed:', questsResponse.data);
    console.log('');

    // Test getting leaderboard
    console.log('5. Testing get leaderboard...');
    const leaderboardResponse = await axios.get(`${BASE_URL}/leaderboard/stars`);
    console.log('✅ Get leaderboard passed:', leaderboardResponse.data);
    console.log('');

    console.log('🎉 All backend tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBackend();
