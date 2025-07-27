#!/usr/bin/env node

// Simple connection test for Ganache and contract
const { ethers } = require('ethers');

const GANACHE_URL = 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = '0x7fD64BF0370329EC4eb451B773eadC0928579f66';

async function testConnection() {
  console.log('🔍 Testing Ganache Connection...\n');

  try {
    // Test Ganache connection
    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log('✅ Ganache Connection:');
    console.log(`   RPC URL: ${GANACHE_URL}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Block Number: ${blockNumber}\n`);

    // Test contract deployment
    const code = await provider.getCode(CONTRACT_ADDRESS);
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at:', CONTRACT_ADDRESS);
      return false;
    }
    
    console.log('✅ Contract Deployment:');
    console.log(`   Address: ${CONTRACT_ADDRESS}`);
    console.log(`   Code Length: ${code.length} bytes\n`);

    // Test basic contract call
    const abi = [
      "function userExists(string uid) public view returns (bool)"
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    // Test with a dummy user ID
    const exists = await contract.userExists('test-user-123');
    console.log('✅ Contract Function Test:');
    console.log(`   userExists('test-user-123'): ${exists}\n`);

    console.log('🎉 All tests passed! Connection is working properly.');
    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure Ganache is running on port 7545');
      console.log('   Command: ganache-cli --port 7545 --deterministic');
    }
    
    return false;
  }
}

testConnection();