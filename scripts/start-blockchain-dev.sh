#!/bin/bash

# BookMyBlock - Blockchain Development Startup Script
echo "🚀 Starting BookMyBlock Blockchain Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if Ganache is running
echo -e "${BLUE}Checking Ganache status...${NC}"
if check_port 7545; then
    echo -e "${GREEN}✅ Ganache is running on port 7545${NC}"
else
    echo -e "${RED}❌ Ganache is not running on port 7545${NC}"
    echo -e "${YELLOW}Please start Ganache CLI or Ganache GUI on port 7545${NC}"
    echo -e "${YELLOW}Command: ganache-cli --port 7545 --deterministic${NC}"
    exit 1
fi

# Check if contracts are deployed
echo -e "${BLUE}Checking contract deployment...${NC}"
CONTRACT_ADDRESS="0xe4f15160b3A6875fac9fA81348E7f4BB72c28769"

# Test connection to Ganache
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$CONTRACT_ADDRESS'","latest"],"id":1}' \
   http://127.0.0.1:7545 | grep -q '"result":"0x"'; then
    echo -e "${RED}❌ Contract not deployed at $CONTRACT_ADDRESS${NC}"
    echo -e "${YELLOW}Running contract deployment...${NC}"
    
    cd User/packages/contracts
    if truffle migrate --reset; then
        echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
    else
        echo -e "${RED}❌ Contract deployment failed${NC}"
        exit 1
    fi
    cd ../../..
else
    echo -e "${GREEN}✅ Contract is deployed at $CONTRACT_ADDRESS${NC}"
fi

# Start the frontend development server
echo -e "${BLUE}Starting frontend development server...${NC}"
cd User/packages/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start the development server
echo -e "${GREEN}🎉 Starting frontend on http://localhost:5173${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the development server${NC}"
npm run dev