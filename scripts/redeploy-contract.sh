#!/bin/bash

# BookMyBlock - Clean Contract Redeployment Script
echo "🔄 Redeploying UserAuth Contract to Ganache"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Ganache is running
echo -e "${BLUE}Checking Ganache status...${NC}"
if ! curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}' \
   http://127.0.0.1:7545 > /dev/null; then
    echo -e "${RED}❌ Ganache is not running on port 7545${NC}"
    echo -e "${YELLOW}Please start Ganache first:${NC}"
    echo -e "${YELLOW}  ganache-cli --port 7545 --deterministic${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ganache is running${NC}"

# Navigate to contracts directory
cd User/packages/contracts

# Clean previous deployments
echo -e "${BLUE}Cleaning previous deployments...${NC}"
rm -rf build/

# Compile contracts
echo -e "${BLUE}Compiling contracts...${NC}"
if truffle compile; then
    echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
else
    echo -e "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi

# Deploy contracts with reset
echo -e "${BLUE}Deploying contracts to Ganache...${NC}"
if truffle migrate --reset --network development; then
    echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
else
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi

# Get the deployed contract address
echo -e "${BLUE}Getting deployed contract address...${NC}"
CONTRACT_ADDRESS=$(truffle networks | grep "UserAuth" | awk '{print $2}' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${YELLOW}⚠️ Could not automatically detect contract address${NC}"
    echo -e "${YELLOW}Please check Ganache GUI for the deployed contract address${NC}"
    echo -e "${YELLOW}And update User/packages/frontend/.env manually${NC}"
else
    echo -e "${GREEN}✅ Contract deployed at: $CONTRACT_ADDRESS${NC}"
    
    # Update .env file
    cd ../../frontend
    if [ -f .env ]; then
        # Update existing .env
        if grep -q "VITE_USER_AUTH_CONTRACT_ADDRESS" .env; then
            sed -i.bak "s/VITE_USER_AUTH_CONTRACT_ADDRESS=.*/VITE_USER_AUTH_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
            echo -e "${GREEN}✅ Updated .env file with new contract address${NC}"
        else
            echo "VITE_USER_AUTH_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
            echo -e "${GREEN}✅ Added contract address to .env file${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ .env file not found in frontend directory${NC}"
    fi
fi

echo -e "${GREEN}🎉 Contract redeployment complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Refresh your frontend application"
echo -e "2. The new contract address should be automatically detected"
echo -e "3. Test the blockchain logging functionality"