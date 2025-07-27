#!/bin/bash

echo "🧹 Cleaning build artifacts and cache..."

# Clean dist folders
rm -rf User/packages/frontend/dist
rm -rf Admin/packages/frontend/dist  
rm -rf Owner/packages/frontend/dist

# Clean node_modules/.vite cache
rm -rf User/packages/frontend/node_modules/.vite
rm -rf Admin/packages/frontend/node_modules/.vite
rm -rf Owner/packages/frontend/node_modules/.vite

echo "✅ Clean complete!"
echo ""
echo "🚀 Starting development servers..."
echo ""
echo "📱 User Dashboard: http://localhost:3000"
echo "🔧 Admin Dashboard: http://localhost:3001" 
echo "🏢 Owner Dashboard: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all servers"

# Start all dashboards
npm run dev:all