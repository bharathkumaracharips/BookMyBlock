#!/usr/bin/env node

console.log('🔍 Privy Configuration Check\n')

console.log('📋 Current Setup:')
console.log('   Privy App ID: cmdixityf004cl10kymjigdke')
console.log('   User Dashboard: http://localhost:3000 ✅ (likely working)')
console.log('   Admin Dashboard: http://localhost:3001 ❌ (origin not allowed)')
console.log('   Owner Dashboard: http://localhost:3002 ❌ (origin not allowed)')

console.log('\n🚨 Error Details:')
console.log('   Error: Origin not allowed')
console.log('   Cause: Privy app only allows localhost:3000')
console.log('   Fix: Add localhost:3001 and localhost:3002 to allowed origins')

console.log('\n✅ Solution Steps:')
console.log('   1. Go to https://dashboard.privy.io')
console.log('   2. Login and select your app')
console.log('   3. Go to Settings → Configuration')
console.log('   4. Add these allowed origins:')
console.log('      - http://localhost:3000')
console.log('      - http://localhost:3001') 
console.log('      - http://localhost:3002')
console.log('   5. Save changes')
console.log('   6. Restart dev servers: ./restart-dev.sh')

console.log('\n🔧 Alternative: Use separate Privy apps for each dashboard')
console.log('   - Create 3 different Privy apps')
console.log('   - Each with its own App ID and allowed origin')
console.log('   - Update .env files with respective App IDs')

console.log('\n📞 Need Help?')
console.log('   - Check PRIVY_ORIGIN_FIX.md for detailed instructions')
console.log('   - Privy Documentation: https://docs.privy.io')
console.log('   - Support: https://privy.io/support')