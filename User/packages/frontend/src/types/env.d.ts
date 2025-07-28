/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_GANACHE_RPC_URL: string
  readonly VITE_GANACHE_CHAIN_ID: string
  readonly VITE_USER_AUTH_CONTRACT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}