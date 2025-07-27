#!/usr/bin/env node

const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const PORT = 3000

console.log('🚀 Starting BookMyBlock Proxy Server...')

// Serve different dashboards on different paths
app.use('/user', createProxyMiddleware({
  target: 'http://localhost:3100',
  changeOrigin: true,
  pathRewrite: { '^/user': '' }
}))

app.use('/admin', createProxyMiddleware({
  target: 'http://localhost:3101', 
  changeOrigin: true,
  pathRewrite: { '^/admin': '' }
}))

app.use('/owner', createProxyMiddleware({
  target: 'http://localhost:3102',
  changeOrigin: true, 
  pathRewrite: { '^/owner': '' }
}))

// Default to user dashboard
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3100',
  changeOrigin: true
}))

app.listen(PORT, () => {
  console.log(`📱 User Dashboard: http://localhost:${PORT}/user`)
  console.log(`🔧 Admin Dashboard: http://localhost:${PORT}/admin`)
  console.log(`🏢 Owner Dashboard: http://localhost:${PORT}/owner`)
  console.log(`\n⚠️  Make sure to start the individual dev servers on ports 3100, 3101, 3102`)
})

module.exports = app