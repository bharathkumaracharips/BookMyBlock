import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig } from '../config/web3'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      {children}
    </PrivyProvider>
  )
}