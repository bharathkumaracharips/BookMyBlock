# BookMyBlock Platform

A decentralized ticketing platform built on Polygon blockchain.

## Project Structure

```
bookmyblock-platform/
├── packages/
│   ├── frontend/          # React frontend application
│   ├── backend/           # Node.js API server
│   └── contracts/         # Smart contracts (Hardhat)
├── package.json           # Root package.json with workspaces
└── README.md
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   cp packages/contracts/.env.example packages/contracts/.env
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

## Development

### Frontend (React + Vite)
- **Port:** 3000
- **Tech Stack:** React, TypeScript, Tailwind CSS, Vite
- **Web3:** Wagmi, Ethers.js, Web3Modal

### Backend (Node.js + Express)
- **Port:** 3001
- **Tech Stack:** Express, TypeScript, MongoDB, Redis
- **Features:** JWT auth, rate limiting, validation

### Smart Contracts (Hardhat)
- **Network:** Polygon Mumbai (testnet)
- **Tech Stack:** Solidity, Hardhat, OpenZeppelin
- **Features:** NFT tickets, event management

## Scripts

- `npm run dev` - Start frontend and backend in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests for all packages
- `npm run lint` - Lint all packages

## Environment Setup

Make sure to configure the following in your `.env` files:

- MongoDB connection string
- Redis connection string
- Polygon RPC URLs
- Private key for contract deployment
- JWT secret
- External API keys (Twilio, SMTP, etc.)

## Deployment

1. **Smart Contracts:**
   ```bash
   cd packages/contracts
   npm run deploy:testnet
   ```

2. **Backend & Frontend:**
   Follow your preferred deployment strategy (Vercel, Railway, etc.)