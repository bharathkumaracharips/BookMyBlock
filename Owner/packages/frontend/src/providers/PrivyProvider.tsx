import React, { useEffect } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig } from '../config/web3'

interface AppProvidersProps {
  children: React.ReactNode
}

// Custom storage isolation for Owner dashboard
const isolateOwnerStorage = () => {
  const originalSetItem = localStorage.setItem
  const originalGetItem = localStorage.getItem
  const originalRemoveItem = localStorage.removeItem

  localStorage.setItem = function(key: string, value: string) {
    if (key.includes('privy')) {
      return originalSetItem.call(this, `owner:${key}`, value)
    }
    return originalSetItem.call(this, key, value)
  }

  localStorage.getItem = function(key: string) {
    if (key.includes('privy')) {
      return originalGetItem.call(this, `owner:${key}`)
    }
    return originalGetItem.call(this, key)
  }

  localStorage.removeItem = function(key: string) {
    if (key.includes('privy')) {
      return originalRemoveItem.call(this, `owner:${key}`)
    }
    return originalRemoveItem.call(this, key)
  }
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    isolateOwnerStorage()
  }, [])

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      {children}
    </PrivyProvider>
  )
}