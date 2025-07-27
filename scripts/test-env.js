#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Testing Environment Variables...\n')

const dashboards = ['User', 'Admin', 'Owner']

dashboards.forEach(dashboard => {
  const envPath = path.join(__dirname, dashboard, 'packages', 'frontend', '.env')
  
  console.log(`📁 ${dashboard} Dashboard:`)
  console.log(`   Path: ${envPath}`)
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const privyMatch = envContent.match(/VITE_PRIVY_APP_ID=(.+)/)
    const apiMatch = envContent.match(/VITE_API_BASE_URL=(.+)/)
    
    console.log(`   ✅ .env file exists`)
    console.log(`   🔑 PRIVY_APP_ID: ${privyMatch ? privyMatch[1] : 'NOT FOUND'}`)
    console.log(`   🌐 API_BASE_URL: ${apiMatch ? apiMatch[1] : 'NOT FOUND'}`)
  } else {
    console.log(`   ❌ .env file missing`)
  }
  console.log('')
})

console.log('🚀 To fix loading issues:')
console.log('1. Stop all dev servers (Ctrl+C)')
console.log('2. Clear browser cache and localStorage')
console.log('3. Run: ./restart-dev.sh')
console.log('4. Check browser console for debug logs')