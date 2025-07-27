#!/bin/bash

echo "🚀 Deploying BookMyBlock UserAuth Contracts to Ganache"
echo "======================================================"

# Check if Ganache is running
echo "📡 Checking Ganache connection..."
if ! curl -s http://127.0.0.1:7545 > /dev/null; then
    echo "❌ Ganache not running on port 7545"
    echo "Please start Ganache GUI or run: ganache-cli -p 7545"
    exit 1
fi

echo "✅ Ganache is running"
echo ""

# Deploy User contract
echo "👤 Deploying User Dashboard Contract..."
cd ../User/packages/contracts
npm run migrate:development > /tmp/user_deploy.log 2>&1

if [ $? -eq 0 ]; then
    USER_ADDRESS=$(grep -o "0x[a-fA-F0-9]\{40\}" /tmp/user_deploy.log | tail -1)
    echo "✅ User contract deployed at: $USER_ADDRESS"
else
    echo "❌ User contract deployment failed"
    cat /tmp/user_deploy.log
    exit 1
fi

cd ../../../..

# Deploy Admin contract  
echo "🔧 Deploying Admin Dashboard Contract..."
cd ../Admin/packages/contracts
npm run migrate:development > /tmp/admin_deploy.log 2>&1

if [ $? -eq 0 ]; then
    ADMIN_ADDRESS=$(grep -o "0x[a-fA-F0-9]\{40\}" /tmp/admin_deploy.log | tail -1)
    echo "✅ Admin contract deployed at: $ADMIN_ADDRESS"
else
    echo "❌ Admin contract deployment failed"
    cat /tmp/admin_deploy.log
    exit 1
fi

cd ../../../..

# Deploy Owner contract
echo "🏢 Deploying Owner Dashboard Contract..."
cd ../Owner/packages/contracts  
npm run migrate:development > /tmp/owner_deploy.log 2>&1

if [ $? -eq 0 ]; then
    OWNER_ADDRESS=$(grep -o "0x[a-fA-F0-9]\{40\}" /tmp/owner_deploy.log | tail -1)
    echo "✅ Owner contract deployed at: $OWNER_ADDRESS"
else
    echo "❌ Owner contract deployment failed"
    cat /tmp/owner_deploy.log
    exit 1
fi

cd ../../../..

# Summary
echo ""
echo "🎉 All contracts deployed successfully!"
echo "======================================"
echo "👤 User Contract:  $USER_ADDRESS"
echo "🔧 Admin Contract: $ADMIN_ADDRESS"  
echo "🏢 Owner Contract: $OWNER_ADDRESS"
echo ""

# Update environment files
echo "📝 Updating environment files..."

# Update User .env
echo "VITE_USER_AUTH_CONTRACT_ADDRESS=$USER_ADDRESS" >> ../User/packages/frontend/.env
echo "✅ Updated User/packages/frontend/.env"

# Update Admin .env  
echo "VITE_ADMIN_AUTH_CONTRACT_ADDRESS=$ADMIN_ADDRESS" >> ../Admin/packages/frontend/.env
echo "✅ Updated Admin/packages/frontend/.env"

# Update Owner .env
echo "VITE_OWNER_AUTH_CONTRACT_ADDRESS=$OWNER_ADDRESS" >> ../Owner/packages/frontend/.env
echo "✅ Updated Owner/packages/frontend/.env"

echo ""
echo "🚀 Ready to test! Start your frontend dashboards:"
echo "   User:  cd User && npm run dev"
echo "   Admin: cd Admin && npm run dev"  
echo "   Owner: cd Owner && npm run dev"

# Clean up temp files
rm -f /tmp/user_deploy.log /tmp/admin_deploy.log /tmp/owner_deploy.log