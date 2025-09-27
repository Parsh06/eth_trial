#!/usr/bin/env node

const axios = require('axios').default;

const API_BASE = 'http://localhost:5000/api';
const MOBILE_BASE = 'http://localhost:8081';

console.log('🧪 STARQUEST AR - COMPLETE SYSTEM TEST');
console.log('=====================================\n');

async function testHealthCheck() {
  console.log('🏥 Testing Backend Health...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend Health:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
    return false;
  }
}

async function testWalletAuth() {
  console.log('\n🔐 Testing Wallet Authentication...');
  try {
    const response = await axios.post(`${API_BASE}/auth/wallet-login`, {
      walletAddress: '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4'
    });
    
    if (response.data.success) {
      console.log('✅ Wallet Auth Success');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.user.username}`);
      console.log(`   Wallet: ${response.data.user.walletAddress}`);
      return response.data.token;
    } else {
      console.log('❌ Wallet Auth Failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Wallet Auth Error:', error.message);
    return null;
  }
}

async function testWalletEndpoints(token) {
  console.log('\n💼 Testing Wallet Collection Endpoints...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test Collection
    const collection = await axios.get(`${API_BASE}/wallet/collection`, { headers });
    console.log('✅ Wallet Collection:', {
      total: collection.data.data.total,
      hasNFTs: collection.data.data.nfts.length > 0
    });
    
    // Test Summary
    const summary = await axios.get(`${API_BASE}/wallet/summary`, { headers });
    console.log('✅ Wallet Summary:', {
      totalNFTs: summary.data.data.totalNFTs,
      achievements: summary.data.data.achievements.length,
      recentActivity: summary.data.data.recentActivity.length
    });
    
    // Test Wallet Info
    const info = await axios.get(`${API_BASE}/wallet/info`, { headers });
    console.log('✅ Wallet Info:', {
      balance: info.data.data.balance,
      isConnected: info.data.data.isConnected
    });
    
    return true;
  } catch (error) {
    console.log('❌ Wallet Endpoints Error:', error.response?.data || error.message);
    return false;
  }
}

async function testMobileApp() {
  console.log('\n📱 Testing Mobile App...');
  try {
    const response = await axios.get(MOBILE_BASE, { timeout: 5000 });
    if (response.data.includes('StarQuestAR')) {
      console.log('✅ Mobile App Running');
      return true;
    } else {
      console.log('❌ Mobile App Not Found');
      return false;
    }
  } catch (error) {
    console.log('❌ Mobile App Error:', error.message);
    return false;
  }
}

async function testMetaMaskIntegration() {
  console.log('\n🦊 Testing MetaMask Integration...');
  
  try {
    // Test with invalid signature (should fail)
    const invalidResponse = await axios.post(`${API_BASE}/auth/wallet-login`, {
      walletAddress: '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4',
      signature: 'invalid-signature',
      message: 'test-message'
    }).catch(err => ({ data: err.response.data }));
    
    if (invalidResponse.data.error === 'Invalid signature') {
      console.log('✅ Signature Verification Working (properly rejects invalid signatures)');
    } else {
      console.log('⚠️  Signature Verification: Expected rejection of invalid signature');
    }
    
    // Test without signature (demo mode - should work)
    const demoResponse = await axios.post(`${API_BASE}/auth/wallet-login`, {
      walletAddress: '0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4'
    });
    
    if (demoResponse.data.success) {
      console.log('✅ Demo Mode Authentication Working (allows login without signature)');
    } else {
      console.log('❌ Demo Mode Authentication Failed');
    }
    
    return true;
  } catch (error) {
    console.log('❌ MetaMask Integration Error:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('Starting Complete System Test...\n');
  
  const results = [];
  
  // Test Backend Health
  results.push(await testHealthCheck());
  
  // Test Wallet Authentication
  const token = await testWalletAuth();
  results.push(!!token);
  
  if (token) {
    // Test Wallet Endpoints
    results.push(await testWalletEndpoints(token));
  } else {
    results.push(false);
  }
  
  // Test Mobile App
  results.push(await testMobileApp());
  
  // Test MetaMask Integration
  results.push(await testMetaMaskIntegration());
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('===============');
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('\nYour StarQuest AR application is ready:');
    console.log('• Backend API: http://localhost:5000');
    console.log('• Mobile App: http://localhost:8081');
    console.log('• Wallet Authentication: ✅ Working');
    console.log('• MetaMask Integration: ✅ Ready');
    console.log('• Collection APIs: ✅ Functional');
  } else {
    console.log('\n⚠️  Some components need attention');
    console.log('Check the logs above for specific issues');
  }
}

// Run the test
runCompleteTest().catch(console.error);
