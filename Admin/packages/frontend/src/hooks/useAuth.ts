import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useMemo, useEffect } from 'react'

export function useAuth() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    getAccessToken,
    createWallet
  } = usePrivy()
  
  const { wallets } = useWallets()

  // Force wallet creation if user is authenticated but has no embedded wallet
  useEffect(() => {
    if (ready && authenticated && user && wallets.length === 0) {
      console.log('🔧 Admin: No wallets found, creating embedded wallet...')
      createWallet().catch(error => {
        console.error('🔧 Admin: Failed to create wallet:', error)
      })
    }
  }, [ready, authenticated, user, wallets.length, createWallet])

  const embeddedWallet = useMemo(() => {
    return wallets.find(wallet => wallet.walletClientType === 'privy')
  }, [wallets])

  const userInfo = useMemo(() => {
    if (!user) return null

    return {
      id: user.id,
      email: user.email?.address,
      phone: user.phone?.number,
      google: user.google?.email,
      apple: user.apple?.email,
      walletAddress: embeddedWallet?.address,
      loginMethod: user.email ? 'email' 
                  : user.phone ? 'sms'
                  : user.google ? 'google'
                  : user.apple ? 'apple'
                  : 'wallet'
    }
  }, [user, embeddedWallet])

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessToken()
      
      return fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  return {
    ready,
    authenticated,
    user: userInfo,
    embeddedWallet,
    login,
    logout,
    apiCall,
  }
}