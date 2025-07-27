import { useEffect } from 'react'
import { privyConfig } from '../../config/web3'

export function PrivyDebug() {
  useEffect(() => {
    console.log('🏢 Owner Dashboard - Privy Config:', {
      appId: privyConfig.appId,
      hasConfig: !!privyConfig.config,
      envVar: import.meta.env.VITE_PRIVY_APP_ID,
      port: window.location.port
    })
  }, [])

  return null
}