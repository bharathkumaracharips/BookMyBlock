# Admin Dashboard - Wallet ID Not Showing Debug

## Problem
Wallet ID is showing in User dashboard but not in Admin dashboard profile dropdown.

## Debugging Steps

### 1. Check Browser Console
Open Admin dashboard (localhost:3001) and check console for:
- 🔧 Admin Dashboard - Privy Config
- 🔧 Admin Dashboard - Wallets Debug  
- 🔧 Admin ProfileDropdown Debug

### 2. Expected Debug Output
```javascript
// Should see:
🔧 Admin Dashboard - Privy Config: {
  appId: "cmdl7k1bn007yju0j69l26zo0",
  hasConfig: true,
  envVar: "cmdl7k1bn007yju0j69l26zo0",
  port: "3001"
}

🔧 Admin Dashboard - Wallets Debug: {
  walletsCount: 1,
  wallets: [{
    address: "0x...",
    type: "privy",
    chainType: "ethereum"
  }]
}

🔧 Admin ProfileDropdown Debug: {
  authenticated: true,
  hasUser: true,
  userId: "did:privy:...",
  hasEmbeddedWallet: true,
  walletAddress: "0x...",
  walletType: "privy"
}
```

### 3. Possible Issues

#### Issue 1: Embedded Wallet Not Created
If `hasEmbeddedWallet: false`:
- Check Privy Admin app configuration
- Ensure "Embedded Wallets" is enabled
- Check "Create on Login" setting

#### Issue 2: Wallet Not Found
If `walletsCount: 0`:
- Wallet creation failed during login
- Different Privy app configuration
- Storage isolation issue

#### Issue 3: Wrong Wallet Type
If wallet type is not "privy":
- External wallet connected instead
- Embedded wallet config issue

## 🔧 Quick Fixes

### Fix 1: Force Wallet Creation
Add to Admin useAuth hook:
```typescript
const { createWallet } = usePrivy()

// Force create wallet if missing
useEffect(() => {
  if (authenticated && !embeddedWallet) {
    createWallet()
  }
}, [authenticated, embeddedWallet])
```

### Fix 2: Check Privy App Settings
1. Go to https://dashboard.privy.io
2. Select Admin app: `cmdl7k1bn007yju0j69l26zo0`
3. Check Settings → Embedded Wallets:
   - ✅ Enable embedded wallets
   - ✅ Create on login: "users-without-wallets"
   - ✅ Show wallet UIs: false

### Fix 3: Clear Admin Storage
```javascript
// In Admin dashboard console:
Object.keys(localStorage).forEach(key => {
  if (key.includes('privy') || key.includes('admin:')) {
    localStorage.removeItem(key)
  }
})
// Then refresh and login again
```

## 🎯 Expected Result
After fixing, Admin profile dropdown should show:
- ✅ User ID: `did:privy:...`
- ✅ Wallet Address: `0x...` (truncated)
- ✅ Copy buttons working
- ✅ Same functionality as User dashboard