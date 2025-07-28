import type { PrivyClientConfig } from '@privy-io/react-auth'

// Ganache local blockchain configuration
export const ganache = {
  id: 5777,
  name: 'Ganache Local',
  network: 'ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:7545'],
    },
    public: {
      http: ['http://127.0.0.1:7545'],
    },
  },
}

// Privy configuration for User dashboard with Ganache
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'cmdixityf004cl10kymjigdke',
  config: {
    loginMethods: ['email', 'sms', 'google', 'apple', 'wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#8b5cf6',
      logo: undefined,
      showWalletLoginFirst: false,
      walletChainType: 'ethereum-only',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
      showWalletUIs: false,
    },
    defaultChain: ganache,
    supportedChains: [ganache],
    legal: {
      termsAndConditionsUrl: 'https://bookmyblock.com/terms',
      privacyPolicyUrl: 'https://bookmyblock.com/privacy',
    },
  } as PrivyClientConfig,
}

export const supportedChains = [ganache]