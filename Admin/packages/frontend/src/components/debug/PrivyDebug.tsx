import { useEffect } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { privyConfig } from '../../config/web3'

export function PrivyDebug() {
  const { wallets } = useWallets()

  useEffect(() => {
    console.log('🔧 Admin Dashboard - Privy Config:', {
      appId: privyConfig.appId,
      hasConfig: !!privyConfig.config,
      envVar: import.meta.env.VITE_PRIVY_APP_ID,
      port: window.location.port
    })
  }, [])

  useEffect(() => {
    console.log('🔧 Admin Dashboard - Wallets Debug:', {
      walletsCount: wallets.length,
      wallets: wallets.map(w => ({
        address: w.address,
        type: w.walletClientType,
        chainType: w.chainType
      }))
    })
  }, [wallets])

  return null
}