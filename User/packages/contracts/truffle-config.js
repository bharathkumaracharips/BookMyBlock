const HDWalletProvider = require('@truffle/hdwallet-provider');

// Mnemonic for development (use environment variable in production)
const mnemonic = process.env.MNEMONIC || "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

module.exports = {
  // Configure networks
  networks: {
    // Development network (Ganache)
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ganache GUI port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 6721975,          // Gas limit
      gasPrice: 20000000000, // 20 gwei (in wei)
    },

    // Ganache CLI
    ganache: {
      host: "127.0.0.1",
      port: 8545,            // Standard Ganache CLI port
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
    },

    // Test network for automated testing
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
    },

    // Polygon Mumbai Testnet (for later use)
    mumbai: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://rpc-mumbai.maticvigil.com`
      ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 10000000000,
    },

    // Polygon Mainnet (for production)
    polygon: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://polygon-rpc.com`
      ),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 30000000000,
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",      // Fetch exact version from solc-bin
      settings: {             // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  },

  // Truffle DB is currently disabled by default
  db: {
    enabled: false
  },

  // Plugin configuration
  plugins: [
    'truffle-plugin-verify'
  ],

  // API keys for verification (add to .env file)
  api_keys: {
    polygonscan: process.env.POLYGONSCAN_API_KEY
  }
};