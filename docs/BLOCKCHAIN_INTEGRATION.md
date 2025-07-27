# BookMyBlock - Activity Logging Integration Guide

## Overview
This guide explains how to use the **Activity Logger** system that combines **Privy authentication** with **Ganache blockchain logging**. 

**Key Concept**: 
- **Privy handles user authentication** (login/logout)
- **Ganache blockchain stores activity logs** (timestamps, counts, etc.)

## Setup

### 1. Prerequisites
- **Ganache CLI or Ganache GUI** running on port 7545
- UserAuth contract deployed (address: `0xe4f15160b3A6875fac9fA81348E7f4BB72c28769`)
- Frontend dependencies installed

### 2. Environment Configuration
The `.env` file in `User/packages/frontend/` contains:
```env
# Local Ganache Blockchain Configuration (for logging only)
VITE_GANACHE_RPC_URL=http://127.0.0.1:7545
VITE_GANACHE_CHAIN_ID=1337

# Smart Contract Addresses (Deployed on Ganache)
VITE_USER_AUTH_CONTRACT_ADDRESS=0xe4f15160b3A6875fac9fA81348E7f4BB72c28769
```

### 3. Start Ganache
Make sure Ganache is running:
```bash
# Ganache CLI
ganache-cli --port 7545 --deterministic

# Or use Ganache GUI on port 7545
```

### 4. Quick Start
Run the development environment:
```bash
./scripts/start-blockchain-dev.sh
```

## Architecture

### 1. **Privy Authentication** (Primary)
- Handles user login/logout/registration
- Creates embedded wallets for users
- Manages user sessions and authentication state
- Can work on any network (Polygon, etc.)

### 2. **Blockchain Logger** (Secondary)
- **Purpose**: Activity logging only, NOT authentication
- Direct connection to Ganache for logging transactions
- Stores user activity timestamps and counts
- Independent of Privy's network configuration

### 3. **Activity Logger Hook** (`useActivityLogger`)
- Simple interface for logging activities to blockchain
- Manages blockchain connection and transaction state
- Fetches user activity history from smart contract

## User Flow

### 1. **Authentication** (Handled by Privy)
1. User visits the app
2. User logs in via Privy (email/SMS/wallet)
3. Privy creates user account and embedded wallet
4. User is now authenticated

### 2. **Automatic Activity Logging** (Stored on Ganache)
1. **First Login** → Automatically creates blockchain signup record
2. **Every Login** → Automatically records login activity with timestamp
3. **Every Logout** → Automatically records logout activity with timestamp
4. **No Manual Buttons** → Everything happens automatically in the background

### 3. **Data Tracked on Blockchain**
- Privy User ID (as unique identifier)
- Wallet Address (from Privy's embedded wallet)
- Signup timestamp
- Login count
- Last action (signup/login/logout)
- Last activity timestamp
- Current session status

## Components

### `ActivityLogger` Component
Main UI component that provides:
- Privy authentication status
- Blockchain connection status
- User activity history from blockchain
- **Automatic logging status** (no manual buttons needed)
- Clear separation: "Privy = Auth, Blockchain = Logs"

### `BlockchainLogger` Service
Backend service that:
- Connects directly to Ganache
- Uses Ganache accounts for signing transactions
- **Automatically triggered** by Privy authentication events
- Logs activities to smart contract without user intervention
- Independent of Privy's network

### `useActivityLogger` Hook
Smart hook that:
- **Detects Privy login/logout events automatically**
- Triggers blockchain transactions in the background
- Handles first-time user signup automatically
- Manages transaction state and error handling
- No manual button clicks required

## Testing

### Manual Testing
1. Open browser to `http://localhost:5173`
2. Check debug panels in bottom corners
3. Connect wallet via Privy
4. Test signup → login → logout flow
5. Verify data persistence in blockchain

### Ganache Verification
You can verify transactions in Ganache:
- Check transaction history in Ganache GUI/CLI logs
- View contract state changes
- Monitor gas usage (free on Ganache)
- Inspect event logs

## Troubleshooting

### Common Issues

1. **"Web3 not initialized"**
   - Ensure **Ganache is running** on port 7545 with Chain ID 1337
   - Check wallet connection in Privy
   - Verify contract address in .env

2. **"Wrong Chain ID"**
   - Make sure Ganache is set to Chain ID 1337
   - Restart Ganache with correct settings
   - Clear browser wallet cache

3. **"User already signed up"**
   - Each Privy user can only signup once
   - Use different wallet or reset Ganache

4. **"User not signed up"**
   - Must signup before login/logout
   - Check if user exists on blockchain

5. **Transaction Failures**
   - Check **Ganache is running** on correct port
   - Ensure sufficient ETH in wallet (Ganache provides free ETH)
   - Verify contract is deployed to Ganache

### Reset Development Environment
```bash
# 1. Stop and restart Ganache
ganache-cli --port 7545 --deterministic --chainId 1337

# 2. Redeploy contracts to fresh Ganache
cd User/packages/contracts
truffle migrate --reset

# 3. Clear browser storage
# Open DevTools → Application → Storage → Clear Site Data
```

## Next Steps

1. **Event Listening**: Add real-time event listeners for contract events
2. **Error Handling**: Improve user-friendly error messages
3. **Loading States**: Add better loading indicators
4. **Offline Support**: Handle network disconnections
5. **Multi-chain**: Support different networks
6. **Gas Optimization**: Optimize contract calls for lower gas costs

## Contract Events

The smart contract emits these events:
- `UserSignedUp(uid, wallet, timestamp)`
- `UserLoggedIn(uid, wallet, timestamp, loginCount)`
- `UserLoggedOut(uid, wallet, timestamp)`

You can listen to these events for real-time updates in your frontend.