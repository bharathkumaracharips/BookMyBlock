import type { PrivyClientConfig } from '@privy-io/react-auth'
// Privy configuration for Admin dashboard - isolated authentication
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
   
    // Custom branding
    legal: {
      termsAndConditionsUrl: 'https://bookmyblock.com/terms',
      privacyPolicyUrl: 'https://bookmyblock.com/privacy',
    },
  } as PrivyClientConfig,
}
