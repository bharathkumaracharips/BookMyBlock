# Truffle + Ganache Setup Guide

## 🎯 Overview

This guide shows how to set up and use Truffle with Ganache for local blockchain development with the BookMyBlock UserAuth contracts.

## 📁 Project Structure

```
BookMyBlock/
├── User/packages/contracts/          # User dashboard contracts
├── Admin/packages/contracts/         # Admin dashboard contracts  
├── Owner/packages/contracts/         # Owner dashboard contracts
└── TRUFFLE_GANACHE_SETUP.md         # This guide
```

Each contracts directory contains:
- `contracts/UserAuth.sol` - Smart contract
- `contracts/Migrations.sol` - Truffle migrations contract
- `migrations/` - Deployment scripts
- `test/` - Test files
- `truffle-config.js` - Truffle configuration

## 🚀 Quick Start

### 1. Install Ganache

**Option A: Ganache GUI (Recommended for beginners)**
```bash
# Download from: https://trufflesuite.com/ganache/
# Install the desktop application
```

**Option B: Ganache CLI**
```bash
npm install -g ganache-cli
```

### 2. Start Ganache

**Using Ganache GUI:**
1. Open Ganache application
2. Click "New Workspace"
3. Set RPC Server to `HTTP://127.0.0.1:7545`
4. Click "Save Workspace"

**Using Ganache CLI:**
```bash
# Start Ganache on port 8545
ganache-cli -p 8545 -m "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
```

### 3. Compile Contracts

```bash
# User Dashboard
cd User/packages/contracts
npm run compile

# Admin Dashboard  
cd Admin/packages/contracts
npm run compile

# Owner Dashboard
cd Owner/packages/contracts
npm run compile
```

### 4. Deploy Contracts

```bash
# User Dashboard
cd User/packages/contracts
npm run migrate:development

# Admin Dashboard
cd Admin/packages/contracts  
npm run migrate:development

# Owner Dashboard
cd Owner/packages/contracts
npm run migrate:development
```

### 5. Run Tests

```bash
# Test User contract
cd User/packages/contracts
npm test

# Test Admin contract
cd Admin/packages/contracts
npm test

# Test Owner contract  
cd Owner/packages/contracts
npm test
```

## 🔧 Configuration Details

### Truffle Networks

Each `truffle-config.js` is configured with these networks:

```javascript
networks: {
  // Ganache GUI (default port 7545)
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*"
  },
  
  // Ganache CLI (default port 8545)
  ganache: {
    host: "127.0.0.1", 
    port: 8545,
    network_id: "*"
  }
}
```

### Available Scripts

Each contracts directory has these npm scripts:

```json
{
  "compile": "truffle compile",
  "test": "truffle test", 
  "migrate": "truffle migrate",
  "migrate:reset": "truffle migrate --reset",
  "migrate:development": "truffle migrate --network development",
  "migrate:ganache": "truffle migrate --network ganache",
  "console": "truffle console",
  "ganache": "ganache-cli -p 8545 -m \"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about\""
}
```

## 📊 Testing Your Setup

### 1. Check Ganache is Running

**Ganache GUI:** Look for green "RPC SERVER" indicator
**Ganache CLI:** Should show "Listening on 127.0.0.1:8545"

### 2. Compile All Contracts

```bash
# Should see "Compilation successful" for each
cd User/packages/contracts && npm run compile
cd Admin/packages/contracts && npm run compile  
cd Owner/packages/contracts && npm run compile
```

### 3. Deploy All Contracts

```bash
# Deploy User contract
cd User/packages/contracts
npm run migrate:development
# Note the contract address: 0x...

# Deploy Admin contract
cd Admin/packages/contracts
npm run migrate:development  
# Note the contract address: 0x...

# Deploy Owner contract
cd Owner/packages/contracts
npm run migrate:development
# Note the contract address: 0x...
```

### 4. Run Contract Tests

```bash
# Test User contract functionality
cd User/packages/contracts
npm test
# Should pass all tests

# Test Admin contract
cd Admin/packages/contracts
npm test

# Test Owner contract
cd Owner/packages/contracts  
npm test
```

## 🎮 Interactive Testing

### Using Truffle Console

```bash
# Start console connected to Ganache
cd User/packages/contracts
npm run console:development

# In the console:
truffle(development)> let instance = await UserAuth.deployed()
truffle(development)> let accounts = await web3.eth.getAccounts()
truffle(development)> await instance.signup("did:privy:test123", accounts[1])
truffle(development)> await instance.login("did:privy:test123")
truffle(development)> let details = await instance.fetchUserDetails("did:privy:test123")
truffle(development)> console.log(details)
```

## 🔗 Frontend Integration

### Update Contract Addresses

After deployment, update your frontend environment variables:

```bash
# User Dashboard (.env)
VITE_USER_AUTH_CONTRACT_ADDRESS=0x... # Address from User deployment

# Admin Dashboard (.env)  
VITE_ADMIN_AUTH_CONTRACT_ADDRESS=0x... # Address from Admin deployment

# Owner Dashboard (.env)
VITE_OWNER_AUTH_CONTRACT_ADDRESS=0x... # Address from Owner deployment
```

### Update Web3 Provider

In your frontend code, connect to Ganache:

```typescript
// Update your web3 provider to point to Ganache
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545")
```

## 🚨 Troubleshooting

### Common Issues

**1. "Error: Could not connect to your Ethereum client"**
- Make sure Ganache is running
- Check the port matches your truffle-config.js
- Try restarting Ganache

**2. "Error: Network with id '...' is not configured"**
- Check your truffle-config.js network settings
- Make sure you're using the right network flag

**3. "Error: Returned error: VM Exception while processing transaction"**
- Check your contract logic
- Make sure you have enough gas
- Verify function parameters

**4. Tests failing**
- Make sure contracts are compiled
- Check if migrations ran successfully
- Verify test accounts have enough ETH

### Reset Everything

If you need to start fresh:

```bash
# Reset migrations (redeploy contracts)
npm run migrate:reset

# Or restart Ganache and redeploy
# 1. Stop Ganache
# 2. Start Ganache  
# 3. Run migrations again
```

## 📈 Next Steps

1. **Deploy contracts** to Ganache
2. **Run tests** to verify functionality
3. **Update frontend** with contract addresses
4. **Test integration** between frontend and contracts
5. **Move to testnet** when ready (Polygon Mumbai)

## 🎯 Expected Results

After following this guide:

✅ **Ganache running** on localhost:7545 or localhost:8545
✅ **All contracts compiled** without errors
✅ **All contracts deployed** with addresses
✅ **All tests passing** for User/Admin/Owner contracts
✅ **Frontend connected** to local blockchain
✅ **Full integration** working locally

This setup gives you a complete local blockchain development environment for testing your UserAuth contracts!