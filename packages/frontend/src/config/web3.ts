import type { PrivyClientConfig } from '@privy-io/react-auth'

// Polygon chain configurations
export const polygonMumbai = {
  id: 80001,
  name: 'Polygon Mumbai',
  network: 'polygon-mumbai',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-mumbai.maticvigil.com'],
    },
    public: {
      http: ['https://rpc-mumbai.maticvigil.com'],
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
  },
}

export const polygon = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://polygon-rpc.com'],
    },
    public: {
      http: ['https://polygon-rpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
}

// Privy configuration for embedded wallets
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    loginMethods: ['email', 'sms', 'google', 'apple', 'wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#8b5cf6',
      logo: undefined, // Remove Privy logo
      showWalletLoginFirst: false,
      walletChainType: 'ethereum-only',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
      showWalletUIs: false,
    },
    defaultChain: polygonMumbai,
    supportedChains: [polygonMumbai, polygon],
    // Custom branding
    legal: {
      termsAndConditionsUrl: 'https://bookmyblock.com/terms',
      privacyPolicyUrl: 'https://bookmyblock.com/privacy',
    },
  } as PrivyClientConfig,
}

export const supportedChains = [polygonMumbai, polygon]