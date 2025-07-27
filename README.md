# BookMyBlock - Decentralized Ticketing Platform

## 🎯 Overview

BookMyBlock is a decentralized ticketing platform built on Polygon blockchain with separate dashboards for Users, Admins, and Venue Owners. Each dashboard has its own authentication system and smart contracts for complete isolation.

## 📁 Project Structure

```
BookMyBlock/
├── User/                          # User Dashboard
│   ├── packages/
│   │   ├── frontend/             # React frontend (port 3000)
│   │   ├── backend/              # Express API (port 8000)
│   │   └── contracts/            # Smart contracts
├── Admin/                         # Admin Dashboard  
│   ├── packages/
│   │   ├── frontend/             # React frontend (port 3001)
│   │   ├── backend/              # Express API (port 8001)
│   │   └── contracts/            # Smart contracts
├── Owner/                         # Owner Dashboard
│   ├── packages/
│   │   ├── frontend/             # React frontend (port 3002)
│   │   ├── backend/              # Express API (port 8002)
│   │   └── contracts/            # Smart contracts
├── docs/                          # 📚 Documentation
└── scripts/                       # 🔧 Utility Scripts
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install dashboard dependencies
npm run install:all
```

### 2. Start Ganache
```bash
# Option 1: Ganache GUI (recommended)
# Download from: https://trufflesuite.com/ganache/

# Option 2: Ganache CLI
ganache-cli -p 7545
```

### 3. Deploy Smart Contracts
```bash
./scripts/deploy-all-contracts.sh
```

### 4. Start All Dashboards
```bash
npm run dev:all
```

## 🌐 Dashboard URLs

- **User Dashboard**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001  
- **Owner Dashboard**: http://localhost:3002

## 🔧 Available Scripts

### Root Level Scripts
```bash
npm run dev:all          # Start all dashboards
npm run dev:user         # Start user dashboard only
npm run dev:admin        # Start admin dashboard only
npm run dev:owner        # Start owner dashboard only
npm run install:all      # Install all dependencies
npm run build:all        # Build all dashboards
```

### Utility Scripts
```bash
./scripts/deploy-all-contracts.sh    # Deploy all smart contracts
./scripts/verify-truffle-setup.sh    # Verify Truffle setup
./scripts/restart-dev.sh             # Clean restart all services
./scripts/test-env.js                # Test environment variables
```

## 📚 Documentation

All documentation is organized in the `docs/` folder:

- **[Truffle Setup Complete](docs/TRUFFLE_SETUP_COMPLETE.md)** - Complete setup guide
- **[Truffle Ganache Setup](docs/TRUFFLE_GANACHE_SETUP.md)** - Detailed Truffle configuration
- **[Smart Contract Integration](docs/SMART_CONTRACT_INTEGRATION.md)** - Contract integration guide
- **[Authentication Isolation](docs/AUTHENTICATION_ISOLATION.md)** - Multi-dashboard auth setup
- **[Environment Structure](docs/ENV_STRUCTURE_CLEAN.md)** - Environment configuration
- **[Port Configuration](docs/PORT_CONFIGURATION.md)** - Port setup guide

## 🔐 Authentication System

Each dashboard has completely isolated authentication:

### Privy App IDs
- **User**: `cmdixityf004cl10kymjigdke`
- **Admin**: `cmdl7k1bn007yju0j69l26zo0`
- **Owner**: `cmdl7kd0b00bcjs0km8ddz2ra`

### Features
- ✅ **Separate user sessions** - No cross-dashboard interference
- ✅ **Independent wallet creation** - Each dashboard creates its own wallets
- ✅ **Isolated localStorage** - Separate storage keys per dashboard
- ✅ **Automatic location detection** - Uses HTML5 geolocation + reverse geocoding

## 🏗️ Smart Contracts

Each dashboard has its own UserAuth contract for activity tracking:

### Contract Features
- **User signup/login tracking**
- **Wallet address mapping**
- **Login count statistics**
- **Blockchain event logging**
- **Role-specific functionality** (Admin/Owner flags)

### Deployment
```bash
# Deploy all contracts to Ganache
./scripts/deploy-all-contracts.sh

# Test all contracts
cd User/packages/contracts && npm test
cd Admin/packages/contracts && npm test
cd Owner/packages/contracts && npm test
```

## 🛠️ Development Workflow

### 1. Setup Development Environment
```bash
# Clone and install
git clone <repository>
cd BookMyBlock
npm install
npm run install:all
```

### 2. Start Blockchain
```bash
# Start Ganache on port 7545
ganache-cli -p 7545
```

### 3. Deploy Contracts
```bash
# Deploy all UserAuth contracts
./scripts/deploy-all-contracts.sh
```

### 4. Start Development Servers
```bash
# Start all dashboards
npm run dev:all

# Or start individually
npm run dev:user    # User dashboard
npm run dev:admin   # Admin dashboard  
npm run dev:owner   # Owner dashboard
```

### 5. Test Integration
- Visit each dashboard URL
- Test login functionality
- Verify wallet creation
- Check contract interactions

## 🔍 Troubleshooting

### Common Issues

**1. Contracts not deploying**
```bash
# Verify Truffle setup
./scripts/verify-truffle-setup.sh

# Check Ganache is running
curl http://127.0.0.1:7545
```

**2. Authentication not working**
```bash
# Clear browser localStorage
# Check Privy App IDs in .env files
# Verify separate storage isolation
```

**3. Port conflicts**
```bash
# Check if ports are available
lsof -i :3000 -i :3001 -i :3002 -i :8000 -i :8001 -i :8002
```

### Debug Tools
```bash
# Test environment variables
node scripts/test-env.js

# Check Privy configuration  
node scripts/check-privy-config.js

# Verify complete setup
./scripts/verify-truffle-setup.sh
```

## 🎯 Key Features

### Multi-Dashboard Architecture
- **User Dashboard** - Event browsing and ticket purchasing
- **Admin Dashboard** - Platform administration and analytics
- **Owner Dashboard** - Venue management and event creation

### Blockchain Integration
- **Polygon Network** - Low-cost, fast transactions
- **Truffle Framework** - Smart contract development
- **Ganache** - Local blockchain for development
- **Privy Authentication** - Web3 wallet integration

### Modern Tech Stack
- **Frontend** - React + TypeScript + Tailwind CSS
- **Backend** - Node.js + Express + MongoDB
- **Blockchain** - Solidity + Truffle + Ethers.js
- **Authentication** - Privy + Embedded Wallets

## 📈 Next Steps

1. **Complete frontend features** for each dashboard
2. **Add more smart contracts** (Ticketing, Events, Payments)
3. **Deploy to Polygon testnet** (Mumbai)
4. **Implement advanced features** (NFT tickets, revenue sharing)
5. **Production deployment** to Polygon mainnet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Building! 🚀**