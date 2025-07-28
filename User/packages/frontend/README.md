# BookMyBlock User Frontend

Simple Web2-like authentication with blockchain transaction logging using Truffle + Ganache.

## 🚀 Quick Start

1. **Start Ganache**
   ```bash
   ganache-cli --port 7545 --deterministic
   ```

2. **Deploy Contracts**
   ```bash
   cd ../contracts
   truffle migrate --reset
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id

# API Configuration  
VITE_API_BASE_URL=http://localhost:8000/api

# Ganache Local Blockchain
VITE_GANACHE_RPC_URL=http://127.0.0.1:7545
VITE_GANACHE_CHAIN_ID=5777

# Smart Contract Address (from Truffle deployment)
VITE_USER_AUTH_CONTRACT_ADDRESS=0xCC99DCA8709CbFf4693d9464B0bdD369117074F8
```

## 🎯 How It Works

### Simple Authentication Flow
1. **New user** → Privy signup → Automatic blockchain signup transaction
2. **Existing user** → Privy login → Automatic blockchain login transaction  
3. **User logout** → Privy logout → Automatic blockchain logout transaction

### Key Features
- ✅ **Web2-like experience** - Just login/logout buttons
- ✅ **Automatic blockchain logging** - No manual blockchain buttons
- ✅ **No duplicates on refresh** - Smart duplicate prevention
- ✅ **Single transactions** - One transaction per action
- ✅ **Truffle + Ganache** - Local development setup

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginButton.tsx          # Main login/logout button
│   └── profile/
│       └── ProfileDropdown.tsx      # User profile dropdown
├── hooks/
│   ├── useSimpleAuth.ts            # Main authentication hook
│   └── useUserAuth.ts              # Enhanced user auth hook
├── services/
│   └── blockchainLogger.ts         # Ganache blockchain logging
├── config/
│   └── web3.ts                     # Ganache chain configuration
└── types/
    └── env.d.ts                    # Environment type definitions
```

## 🔗 Key Components

### useSimpleAuth Hook
Main authentication hook that handles:
- Privy authentication integration
- Automatic blockchain transaction creation
- Duplicate prevention with 1-minute cooldown
- Session management across page refreshes

### LoginButton Component  
Simple login/logout button that:
- Shows "Sign In" when not authenticated
- Shows ProfileDropdown when authenticated
- Handles loading states during blockchain transactions

### BlockchainLogger Service
Handles all blockchain operations:
- Direct connection to Ganache (port 7545)
- User signup/login/logout transaction logging
- Event listening for real-time updates
- Error handling and retry logic

## 🛠 Development

### Prerequisites
- Node.js 18+
- Ganache CLI
- Truffle Suite

### Local Development
1. Ensure Ganache is running on port 7545
2. Deploy contracts using Truffle
3. Update contract address in .env
4. Start development server

### Contract Deployment
```bash
cd User/packages/contracts
truffle compile
truffle migrate --reset
# Copy new contract address to .env
```

## 🔍 Debugging

### Check Blockchain Connection
- Look for "🔧 BlockchainLogger initialized" in console
- Verify contract address matches deployed contract
- Ensure Ganache is running on correct port

### Transaction Logs
- New user: "🆕 New user detected, creating signup transaction"
- Existing user: "🔑 Existing user login, creating login transaction"  
- Logout: "🚪 User logout, creating logout transaction"
- Duplicates: "🔄 User recently processed, skipping duplicate"

## 📝 Notes

- Uses Ganache local blockchain (Chain ID: 5777)
- Contracts deployed via Truffle
- No Polygon/Hardhat dependencies
- Simple, clean codebase focused on core functionality
- Automatic transaction logging without complex UI