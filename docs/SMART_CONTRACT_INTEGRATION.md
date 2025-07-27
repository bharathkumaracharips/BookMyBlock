# Smart Contract Integration - UserAuth

## 📋 Overview

The UserAuth smart contract system provides blockchain-based user authentication and activity logging for the BookMyBlock platform. Each dashboard (User, Admin, Owner) has its own contract instance for complete isolation.

## 🏗️ Contract Structure

### User Dashboard Contract
- **File**: `User/packages/contracts/contracts/UserAuth.sol`
- **Purpose**: Track regular user signup/login activities
- **Features**: Basic authentication, login counting, wallet mapping

### Admin Dashboard Contract  
- **File**: `Admin/packages/contracts/contracts/UserAuth.sol`
- **Purpose**: Track admin user activities
- **Features**: Admin-specific flags, enhanced logging

### Owner Dashboard Contract
- **File**: `Owner/packages/contracts/contracts/UserAuth.sol` 
- **Purpose**: Track venue owner activities
- **Features**: Venue name tracking, owner-specific functionality

## 🔧 Key Features

### Core Functions
```solidity
// Sign up a new user
function signup(string uid, address walletAddress) public

// Login existing user  
function login(string uid) public

// Logout user
function logout(string uid) public

// Get complete user details
function fetchUserDetails(string uid) public view returns (...)

// Check if user exists
function userExists(string uid) public view returns (bool)
```

### Events Emitted
```solidity
event UserSignedUp(string indexed uid, address indexed wallet, uint256 timestamp)
event UserLoggedIn(string indexed uid, address indexed wallet, uint256 timestamp, uint256 loginCount)  
event UserLoggedOut(string indexed uid, address indexed wallet, uint256 timestamp)
```

### Data Tracked
- ✅ **Privy UID**: Unique user identifier
- ✅ **Wallet Address**: User's embedded wallet
- ✅ **Signup/Login Status**: Current authentication state
- ✅ **Login Count**: Total number of logins
- ✅ **Timestamps**: When actions occurred
- ✅ **Last Action**: signup/login/logout

## 🚀 Integration Steps

### 1. Deploy Contracts

```bash
# Deploy to Polygon Mumbai (testnet)
cd User/packages/contracts
npx hardhat deploy --network mumbai

cd Admin/packages/contracts  
npx hardhat deploy --network mumbai

cd Owner/packages/contracts
npx hardhat deploy --network mumbai
```

### 2. Update Environment Variables

```bash
# User Dashboard
VITE_USER_AUTH_CONTRACT_ADDRESS=0x...

# Admin Dashboard  
VITE_ADMIN_AUTH_CONTRACT_ADDRESS=0x...

# Owner Dashboard
VITE_OWNER_AUTH_CONTRACT_ADDRESS=0x...
```

### 3. Frontend Integration

#### Import the Hook
```typescript
import { useUserAuth } from '../hooks/useUserAuth'

function MyComponent() {
  const {
    userDetails,
    isSignedUp,
    isLoggedIn,
    signupUser,
    loginUser,
    logoutUser,
    loading,
    error
  } = useUserAuth()
  
  // Use the contract functions...
}
```

#### Auto-signup on First Login
```typescript
// In your login flow
useEffect(() => {
  if (authenticated && user && embeddedWallet && !isSignedUp) {
    // Auto-signup new users
    signupUser().then(() => {
      console.log('User signed up on blockchain')
    })
  }
}, [authenticated, user, embeddedWallet, isSignedUp])
```

#### Track Login/Logout
```typescript
// On successful Privy login
const handleLogin = async () => {
  await privyLogin() // Your existing Privy login
  
  if (isSignedUp && !isLoggedIn) {
    await loginUser() // Log to blockchain
  }
}

// On logout
const handleLogout = async () => {
  if (isLoggedIn) {
    await logoutUser() // Log to blockchain
  }
  
  await privyLogout() // Your existing Privy logout
}
```

## 📊 Usage Examples

### Check User Status
```typescript
const { userDetails, isSignedUp, isLoggedIn } = useUserAuth()

if (isSignedUp) {
  console.log(`User has logged in ${userDetails.loginCount} times`)
  console.log(`Last action: ${userDetails.lastAction}`)
  console.log(`Signed up: ${new Date(userDetails.signupTimestamp * 1000)}`)
}
```

### Manual Contract Calls
```typescript
const { userAuthContract } = useUserAuth()

// Check if user exists by wallet
const uid = await userAuthContract.getUserByWallet('0x...')

// Get login count
const count = await userAuthContract.getUserLoginCount(uid)
```

## 🔐 Security Features

### Input Validation
- ✅ **Non-empty UIDs**: Prevents empty string attacks
- ✅ **Valid wallet addresses**: Checks for zero address
- ✅ **Duplicate prevention**: No duplicate signups/wallets

### Access Control
- ✅ **Modifier-based validation**: Consistent input checking
- ✅ **State verification**: Ensures proper signup before login
- ✅ **Wallet uniqueness**: One wallet per user

### Event Logging
- ✅ **Indexed events**: Efficient filtering and searching
- ✅ **Timestamp tracking**: Audit trail for all actions
- ✅ **Wallet correlation**: Link actions to specific wallets

## 🎯 Benefits

### For Users
- ✅ **Blockchain verification**: Cryptographic proof of account activity
- ✅ **Cross-platform tracking**: Activity visible across all dashboards
- ✅ **Audit trail**: Complete history of login/logout events

### For Platform
- ✅ **User analytics**: Track engagement and usage patterns
- ✅ **Fraud prevention**: Detect unusual login patterns
- ✅ **Compliance**: Immutable record of user activities

### For Development
- ✅ **Decentralized auth**: Reduce dependency on centralized systems
- ✅ **Event-driven architecture**: React to blockchain events
- ✅ **Multi-dashboard support**: Isolated contracts per dashboard

## 🚨 Important Notes

### Gas Costs
- **Signup**: ~50,000 gas
- **Login**: ~30,000 gas  
- **Logout**: ~25,000 gas
- **Read operations**: Free (view functions)

### Network Requirements
- **Testnet**: Polygon Mumbai for development
- **Mainnet**: Polygon for production
- **Fallback**: Handle network errors gracefully

### Error Handling
```typescript
try {
  await signupUser()
} catch (error) {
  if (error.message.includes('Already signed up')) {
    // Handle duplicate signup
  } else if (error.message.includes('User not found')) {
    // Handle missing user
  } else {
    // Handle other errors
  }
}
```

This smart contract system provides a robust foundation for tracking user authentication across your multi-dashboard platform!