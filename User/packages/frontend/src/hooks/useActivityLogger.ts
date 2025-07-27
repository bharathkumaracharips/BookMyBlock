import { useState, useEffect, useCallback, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { BlockchainLogger } from '../services/blockchainLogger'

interface ActivityLogState {
  isLoading: boolean
  error: string | null
  userLogs: any | null
  isInitialized: boolean
}

export const useActivityLogger = () => {
  const { user, authenticated, ready } = usePrivy()
  const { wallets } = useWallets()
  const [logger] = useState(() => new BlockchainLogger())
  const [state, setState] = useState<ActivityLogState>({
    isLoading: false,
    error: null,
    userLogs: null,
    isInitialized: false
  })

  // Track previous authentication state for auto-logging
  const prevAuthenticatedRef = useRef<boolean>(false)
  const hasLoggedSignupRef = useRef<boolean>(false)
  const isProcessingRef = useRef<boolean>(false)
  const lastLoginTimeRef = useRef<number>(0)

  // Initialize the logger
  const initializeLogger = useCallback(async () => {
    try {
      const success = await logger.initialize()
      setState(prev => ({
        ...prev,
        isInitialized: success,
        error: success ? null : 'Failed to initialize blockchain logger'
      }))
      return success
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: error.message
      }))
      return false
    }
  }, [logger])

  // Simple duplicate prevention - only prevent if login happened very recently (< 30 seconds)
  const isRecentDuplicate = useCallback(() => {
    const now = Date.now()
    const timeSinceLastLogin = now - lastLoginTimeRef.current
    return timeSinceLastLogin < 30000 // 30 seconds
  }, [])

  // Log signup activity
  const logSignup = useCallback(async (walletAddress: string) => {
    if (!user || !state.isInitialized) {
      throw new Error('Logger not initialized or user not authenticated')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const txHash = await logger.logSignup(user.id, walletAddress)

      // Refresh user logs
      await fetchUserLogs()

      setState(prev => ({ ...prev, isLoading: false }))
      return txHash
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }, [user, state.isInitialized, logger])

  // Log login activity
  const logLogin = useCallback(async () => {
    if (!user || !state.isInitialized) {
      throw new Error('Logger not initialized or user not authenticated')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const txHash = await logger.logLogin(user.id)

      // Refresh user logs
      await fetchUserLogs()

      setState(prev => ({ ...prev, isLoading: false }))
      return txHash
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }, [user, state.isInitialized, logger])

  // Log logout activity
  const logLogout = useCallback(async () => {
    if (!user || !state.isInitialized) {
      throw new Error('Logger not initialized or user not authenticated')
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const txHash = await logger.logLogout(user.id)

      // Refresh user logs
      await fetchUserLogs()

      setState(prev => ({ ...prev, isLoading: false }))
      return txHash
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      throw error
    }
  }, [user, state.isInitialized, logger])

  // Fetch user activity logs
  const fetchUserLogs = useCallback(async () => {
    if (!user || !state.isInitialized) {
      return null
    }

    try {
      const logs = await logger.getUserLogs(user.id)
      setState(prev => ({ ...prev, userLogs: logs }))
      return logs
    } catch (error: any) {
      console.error('Failed to fetch user logs:', error)
      return null
    }
  }, [user, state.isInitialized, logger])

  // Check if user exists in blockchain
  const userExistsInBlockchain = useCallback(async () => {
    if (!user || !state.isInitialized) {
      return false
    }

    try {
      return await logger.userExists(user.id)
    } catch (error) {
      return false
    }
  }, [user, state.isInitialized, logger])

  // Test blockchain connection
  const testConnection = useCallback(async () => {
    return await logger.testConnection()
  }, [logger])

  // Auto-log signup (first time user)
  const autoLogSignup = useCallback(async () => {
    if (!user || !state.isInitialized || !wallets.length || hasLoggedSignupRef.current || isProcessingRef.current) {
      return
    }

    try {
      // Check if user already exists in blockchain
      const exists = await logger.userExists(user.id)
      if (exists) {
        hasLoggedSignupRef.current = true
        return
      }

      isProcessingRef.current = true
      console.log('🔄 Auto-logging signup for new user:', user.id)

      const wallet = wallets[0]
      const provider = await wallet.getEthersProvider()
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      const txHash = await logger.logSignup(user.id, address)
      console.log('✅ Auto-signup logged:', txHash)

      hasLoggedSignupRef.current = true
      await fetchUserLogs()

    } catch (error: any) {
      console.error('❌ Auto-signup failed:', error)
      setState(prev => ({ ...prev, error: `Auto-signup failed: ${error.message}` }))
    } finally {
      isProcessingRef.current = false
    }
  }, [user, state.isInitialized, wallets, logger, fetchUserLogs])

  // Auto-log login
  const autoLogLogin = useCallback(async () => {
    if (!user || !state.isInitialized || isProcessingRef.current) {
      return
    }

    try {
      // Check if user exists in blockchain
      const exists = await logger.userExists(user.id)
      if (!exists) {
        console.log('User not in blockchain, will auto-signup first')
        return
      }

      // Prevent rapid duplicate logins (within 30 seconds)
      if (isRecentDuplicate()) {
        console.log('🔄 Recent login detected, skipping duplicate transaction')
        return
      }

      isProcessingRef.current = true
      console.log('🔄 Auto-logging login for user:', user.id)

      const txHash = await logger.logLogin(user.id)
      console.log('✅ Auto-login logged:', txHash)

      // Record the login time
      lastLoginTimeRef.current = Date.now()

      await fetchUserLogs()

    } catch (error: any) {
      console.error('❌ Auto-login failed:', error)
      setState(prev => ({ ...prev, error: `Auto-login failed: ${error.message}` }))
    } finally {
      isProcessingRef.current = false
    }
  }, [user, state.isInitialized, logger, fetchUserLogs, isRecentDuplicate])

  // Auto-log logout
  const autoLogLogout = useCallback(async () => {
    if (!user || !state.isInitialized || isProcessingRef.current) {
      return
    }

    try {
      // Check if user exists in blockchain
      const exists = await logger.userExists(user.id)
      if (!exists) {
        return
      }

      isProcessingRef.current = true
      console.log('🔄 Auto-logging logout for user:', user.id)

      const txHash = await logger.logLogout(user.id)
      console.log('✅ Auto-logout logged:', txHash)

      // Reset login time
      lastLoginTimeRef.current = 0

      await fetchUserLogs()

    } catch (error: any) {
      console.error('❌ Auto-logout failed:', error)
      // Don't set error state for logout as user is leaving
    } finally {
      isProcessingRef.current = false
    }
  }, [user, state.isInitialized, logger, fetchUserLogs])

  // Initialize on mount
  useEffect(() => {
    initializeLogger()
  }, [initializeLogger])

  // Fetch logs when user changes
  useEffect(() => {
    if (authenticated && user && state.isInitialized) {
      fetchUserLogs()
    }
  }, [authenticated, user, state.isInitialized, fetchUserLogs])

  // Auto-detect authentication changes and trigger blockchain logging
  useEffect(() => {
    if (!ready || !state.isInitialized) {
      return
    }

    const wasAuthenticated = prevAuthenticatedRef.current
    const isNowAuthenticated = authenticated

    // User just logged in
    if (!wasAuthenticated && isNowAuthenticated && user) {
      console.log('🔍 User login detected for:', user.id)

      // Small delay to ensure wallet is ready
      setTimeout(async () => {
        try {
          const exists = await logger.userExists(user.id)
          if (!exists) {
            // New user - auto signup
            console.log('🔍 New user detected, auto-signup...')
            await autoLogSignup()
          } else {
            // Existing user - auto login
            console.log('🔍 Existing user detected, auto-login...')
            await autoLogLogin()
          }
        } catch (error) {
          console.error('Error in auto-detection:', error)
        }
      }, 2000) // Increased delay to ensure everything is ready
    }

    // User just logged out
    if (wasAuthenticated && !isNowAuthenticated) {
      if (user) {
        console.log('🔍 User logout detected for:', user.id)
        autoLogLogout()
      }

      // Reset tracking
      lastLoginTimeRef.current = 0
    }

    // Update previous state
    prevAuthenticatedRef.current = isNowAuthenticated
  }, [ready, authenticated, user, state.isInitialized, logger, autoLogSignup, autoLogLogin, autoLogLogout])

  // Reset refs when user changes
  useEffect(() => {
    if (user) {
      hasLoggedSignupRef.current = false
      isProcessingRef.current = false
    }
  }, [user?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset all refs on unmount
      lastLoginTimeRef.current = 0
      isProcessingRef.current = false
    }
  }, [])

  return {
    ...state,
    // Manual logging functions (for testing/debugging)
    logSignup,
    logLogin,
    logLogout,
    // Utility functions
    fetchUserLogs,
    userExistsInBlockchain,
    testConnection,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}