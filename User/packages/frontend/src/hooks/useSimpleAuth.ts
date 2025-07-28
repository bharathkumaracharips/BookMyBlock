/**
 * Simple Authentication Hook
 * 
 * Web2-like authentication flow with blockchain transaction logging:
 * 1. New user -> signup transaction
 * 2. Existing user -> login transaction (no duplicates on refresh)
 * 3. User logout -> logout transaction
 */

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect, useCallback } from 'react'
import { BlockchainLogger } from '../services/blockchainLogger'

export function useSimpleAuth() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    getAccessToken 
  } = usePrivy()
  
  const { wallets } = useWallets()
  const [logger, setLogger] = useState<BlockchainLogger | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessedAuth, setHasProcessedAuth] = useState(false)
  const [lastProcessedUserId, setLastProcessedUserId] = useState<string | null>(null)

  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')

  const userInfo = user ? {
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
  } : null

  // Initialize blockchain logger
  useEffect(() => {
    const initLogger = async () => {
      try {
        const blockchainLogger = new BlockchainLogger()
        const success = await blockchainLogger.initialize()
        if (success) {
          setLogger(blockchainLogger)
        }
      } catch (error) {
        console.error('Failed to initialize blockchain logger:', error)
      }
    }
    initLogger()
  }, [])

  // Cleanup localStorage on unmount
  useEffect(() => {
    return () => {
      // Clear all auth processing flags on unmount
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_processed_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }, [])

  // Handle authentication changes
  useEffect(() => {
    if (!ready || !logger || !authenticated || !user || hasProcessedAuth) {
      return
    }

    // Prevent processing the same user multiple times
    if (lastProcessedUserId === user.id) {
      console.log('🔄 User already processed, skipping:', user.id)
      return
    }

    const processAuth = async () => {
      if (!embeddedWallet?.address) {
        console.log('Waiting for wallet...')
        return
      }

      // Check if we already processed this user in this session
      const sessionKey = `auth_processed_${user.id}`
      const lastProcessed = localStorage.getItem(sessionKey)
      const now = Date.now()
      
      if (lastProcessed && (now - parseInt(lastProcessed)) < 60000) { // 1 minute cooldown
        console.log('🔄 User recently processed, skipping duplicate:', user.id)
        setHasProcessedAuth(true)
        setLastProcessedUserId(user.id)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Check if user exists in blockchain
        const userExists = await logger.userExists(user.id)
        
        if (!userExists) {
          // New user - create signup transaction
          console.log('🆕 New user detected, creating signup transaction...')
          const txHash = await logger.logSignup(user.id, embeddedWallet.address)
          if (txHash) {
            console.log('✅ Signup transaction created:', txHash)
          }
        } else {
          // Existing user - check if already logged in
          const isLoggedIn = await logger.isUserLoggedIn(user.id)
          
          if (!isLoggedIn) {
            // User exists but not logged in - create login transaction
            console.log('🔑 Existing user login, creating login transaction...')
            const txHash = await logger.logLogin(user.id)
            if (txHash) {
              console.log('✅ Login transaction created:', txHash)
            }
          } else {
            console.log('ℹ️ User already logged in, no transaction needed')
          }
        }
        
        setHasProcessedAuth(true)
        setLastProcessedUserId(user.id)
        
        // Mark as processed in localStorage
        localStorage.setItem(sessionKey, now.toString())
        
      } catch (error: any) {
        console.error('❌ Authentication processing failed:', error)
        setError(error.message || 'Authentication failed')
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to ensure wallet is ready
    const timer = setTimeout(processAuth, 1000)
    return () => clearTimeout(timer)
    
  }, [ready, logger, authenticated, user, embeddedWallet, hasProcessedAuth])

  // Reset processing state when user changes
  useEffect(() => {
    if (user && lastProcessedUserId && lastProcessedUserId !== user.id) {
      setHasProcessedAuth(false)
      setLastProcessedUserId(null)
    }
  }, [user?.id, lastProcessedUserId])

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (!logger || !user) {
      await logout()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if user is logged in on blockchain
      const isLoggedIn = await logger.isUserLoggedIn(user.id)
      
      if (isLoggedIn) {
        console.log('🚪 User logout, creating logout transaction...')
        const txHash = await logger.logLogout(user.id)
        if (txHash) {
          console.log('✅ Logout transaction created:', txHash)
        }
      }
      
      // Reset processing flags
      setHasProcessedAuth(false)
      setLastProcessedUserId(null)
      
      // Logout from Privy
      await logout()
      
    } catch (error: any) {
      console.error('❌ Logout failed:', error)
      setError(error.message || 'Logout failed')
      // Still logout from Privy even if blockchain logout fails
      await logout()
    } finally {
      setIsLoading(false)
    }
  }, [logger, user, logout])

  // Get user blockchain status
  const getUserStatus = useCallback(async () => {
    if (!logger || !user) return null
    
    try {
      const userLogs = await logger.getUserLogs(user.id)
      return userLogs
    } catch (error) {
      console.error('Failed to get user status:', error)
      return null
    }
  }, [logger, user])

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessToken()
      
      return fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}${endpoint}`, {
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
    // Privy auth state
    ready,
    authenticated,
    user: userInfo,
    embeddedWallet,
    
    // Actions
    login,
    logout: handleLogout,
    
    // Blockchain state
    isLoading,
    error,
    getUserStatus,
    
    // Utils
    apiCall,
    clearError: () => setError(null)
  }
}