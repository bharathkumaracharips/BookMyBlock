#!/bin/bash

echo "🧹 Ganache Cleanup Utility"
echo "=========================="

echo "This script will help you clean up duplicate contracts in Ganache."
echo ""

# Check if Ganache is running
if curl -s http://127.0.0.1:7545 > /dev/null; then
    echo "📡 Ganache is running on port 7545"
    echo ""
    echo "Options to clean up duplicates:"
    echo ""
    echo "1. 🔄 Restart Ganache (recommended)"
    echo "   - Stop Ganache"
    echo "   - Start it again with: ganache-cli -p 7545"
    echo "   - This will clear all contracts and start fresh"
    echo ""
    echo "2. 🧹 Clean deploy contracts"
    echo "   - Run: npm run clean:deploy"
    echo "   - This will reset migrations and deploy fresh contracts"
    echo ""
    echo "3. 🗑️  Manual cleanup"
    echo "   - Delete build folders: rm -rf */packages/contracts/build"
    echo "   - Reset migrations: truffle migrate --reset"
    echo ""
    
    read -p "Would you like to run clean deploy now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Running clean deployment..."
        ./scripts/clean-deploy.sh
    else
        echo "💡 Run 'npm run clean:deploy' when you're ready"
    fi
else
    echo "❌ Ganache is not running on port 7545"
    echo ""
    echo "To start Ganache:"
    echo "1. Ganache GUI: Download from https://trufflesuite.com/ganache/"
    echo "2. Ganache CLI: ganache-cli -p 7545"
    echo ""
    echo "After starting Ganache, run: npm run clean:deploy"
fi

echo ""
echo "🔍 Understanding the duplicates:"
echo "- Each 'truffle migrate' creates new contract instances"
echo "- Use 'truffle migrate --reset' to redeploy existing contracts"
echo "- Ganache keeps all deployed contracts until restarted"
echo "- Our clean-deploy script handles this automatically"