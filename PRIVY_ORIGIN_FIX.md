# Fix Privy "Origin not allowed" Error

## Problem
```
Uncaught (in promise) r20: Origin not allowed
FetchError: [POST] "https://auth.privy.io/api/v1/oauth/init": 403
```

This error occurs because the Privy App ID is configured to only allow `localhost:3000`, but we're using multiple ports.

## ✅ Solution 1: Update Privy App Configuration (Recommended)

### Step 1: Login to Privy Dashboard
1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Login to your account
3. Select your app: `cmdixityf004cl10kymjigdke`

### Step 2: Update Allowed Origins
1. Go to **Settings** → **Basics** or **Configuration**
2. Find **Allowed Origins** or **Redirect URIs** section
3. Add these origins:
   ```
   http://localhost:3000  (User Dashboard)
   http://localhost:3001  (Admin Dashboard)  
   http://localhost:3002  (Owner Dashboard)
   ```

### Step 3: Save Configuration
1. Click **Save** or **Update**
2. Wait for changes to propagate (usually immediate)

## ✅ Solution 2: Create Separate Privy Apps (Alternative)

If you want completely isolated authentication systems:

### Create 3 Separate Privy Apps:
1. **User App**: `localhost:3000` only
2. **Admin App**: `localhost:3001` only  
3. **Owner App**: `localhost:3002` only

### Update Environment Variables:
```bash
# User Dashboard (.env)
VITE_PRIVY_APP_ID=user-app-id-here

# Admin Dashboard (.env)  
VITE_PRIVY_APP_ID=admin-app-id-here

# Owner Dashboard (.env)
VITE_PRIVY_APP_ID=owner-app-id-here
```

## 🚀 Quick Test After Fix

1. **Clear browser cache** for all three ports
2. **Restart development servers**:
   ```bash
   ./restart-dev.sh
   ```
3. **Test login** on each dashboard:
   - User: http://localhost:3000
   - Admin: http://localhost:3001
   - Owner: http://localhost:3002

## 🔍 Verify Fix

Check browser console - you should see:
- ✅ No "Origin not allowed" errors
- ✅ Debug logs showing correct Privy config
- ✅ "Sign In" buttons working on all dashboards

## 📋 Current Configuration

**Privy App ID**: `cmdixityf004cl10kymjigdke`
**Current Allowed Origin**: `http://localhost:3000` only
**Required Origins**: 
- `http://localhost:3000` (User)
- `http://localhost:3001` (Admin)
- `http://localhost:3002` (Owner)

## ⚠️ Important Notes

1. **Development vs Production**: Make sure to update origins for production URLs too
2. **HTTPS in Production**: Use `https://` for production origins
3. **Wildcard Origins**: Some providers allow `http://localhost:*` but Privy typically requires specific ports
4. **Propagation Time**: Changes usually take effect immediately but may take a few minutes