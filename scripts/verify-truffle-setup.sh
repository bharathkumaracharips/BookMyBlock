#!/bin/bash

echo "🔍 Verifying Truffle Setup for BookMyBlock"
echo "=========================================="

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 (MISSING)"
        return 1
    fi
}

# Function to check directory structure
check_dashboard() {
    local dashboard=$1
    echo ""
    echo "📁 Checking $dashboard Dashboard:"
    echo "--------------------------------"
    
    # Check contracts
    check_file "../$dashboard/packages/contracts/contracts/UserAuth.sol"
    check_file "../$dashboard/packages/contracts/contracts/Migrations.sol"
    
    # Check migrations
    check_file "../$dashboard/packages/contracts/migrations/1_initial_migration.js"
    check_file "../$dashboard/packages/contracts/migrations/2_deploy_user_auth.js"
    
    # Check tests
    check_file "../$dashboard/packages/contracts/test/UserAuth.test.js"
    
    # Check configuration
    check_file "../$dashboard/packages/contracts/truffle-config.js"
    check_file "../$dashboard/packages/contracts/package.json"
    
    # Check if Truffle is installed
    if [ -d "../$dashboard/packages/contracts/node_modules/truffle" ]; then
        echo "✅ Truffle installed"
    else
        echo "❌ Truffle not installed"
    fi
}

# Check all dashboards
check_dashboard "User"
check_dashboard "Admin" 
check_dashboard "Owner"

echo ""
echo "🚀 Setup Scripts:"
echo "=================="
check_file "scripts/deploy-all-contracts.sh"
check_file "scripts/verify-truffle-setup.sh"

echo ""
echo "📋 Summary:"
echo "==========="

# Count missing files
missing_count=0

# Check critical files
critical_files=(
    "../User/packages/contracts/contracts/UserAuth.sol"
    "../Admin/packages/contracts/contracts/UserAuth.sol"
    "../Owner/packages/contracts/contracts/UserAuth.sol"
    "../User/packages/contracts/migrations/2_deploy_user_auth.js"
    "../Admin/packages/contracts/migrations/2_deploy_user_auth.js"
    "../Owner/packages/contracts/migrations/2_deploy_user_auth.js"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        ((missing_count++))
    fi
done

if [ $missing_count -eq 0 ]; then
    echo "🎉 All critical files present!"
    echo "✅ Ready to deploy contracts"
    echo ""
    echo "Next steps:"
    echo "1. Start Ganache: ganache-cli -p 7545"
    echo "2. Deploy contracts: ./scripts/deploy-all-contracts.sh"
    echo "3. Test contracts: cd User/packages/contracts && npm test"
else
    echo "⚠️  $missing_count critical files missing"
    echo "❌ Setup incomplete"
fi

echo ""
echo "🔧 Quick Commands:"
echo "=================="
echo "# Start Ganache GUI or CLI:"
echo "ganache-cli -p 7545"
echo ""
echo "# Compile all contracts:"
echo "cd User/packages/contracts && npm run compile"
echo "cd Admin/packages/contracts && npm run compile"
echo "cd Owner/packages/contracts && npm run compile"
echo ""
echo "# Deploy all contracts:"
echo "./scripts/deploy-all-contracts.sh"
echo ""
echo "# Test all contracts:"
echo "cd User/packages/contracts && npm test"
echo "cd Admin/packages/contracts && npm test"
echo "cd Owner/packages/contracts && npm test"