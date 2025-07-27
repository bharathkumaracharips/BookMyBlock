import { useState, useEffect, useCallback, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { BlockchainLogger } from '../services/blockchainLogger'

interface ActivityLogState {
  isLoading: boolean
  error: string | null
  userLogs: any | null
  isInitialized: boolean
  recentEvents: any[]
  userEvents: any[]
}

export const useActivityLogger = () => {
  const { user, authenticated, ready } = usePrivy()
  const { wallets } = useWallets()
  const [logger] = useState(() => new BlockchainLogger())
  const [state, setState] = useState<ActivityLogState>({
    isLoading: false,
    error: null,
    userLogs: null,
    isInitialized: false,
    recentEvents: [],
    userEvents: []
  })

  // Track previous authentication state for auto-logging
  const prevAuthenticatedRef = useRef<boolean>(false)
  const hasLoggedSignupRef = useRef<boolean>(false)
  const isProcessingRef = useRef<boolean>(false)
  const lastLoginTimeRef = useRef<number>(0)
  const sessionKeyRef = useRef<string>('')

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

  // Session management functions
  const getSessionKey = useCallback((userId: string) => {
    return `blockchain_login_session_${userId}`
  }, [])

  const isSessionActive = useCallback((userId: string) => {
    const sessionKey = getSessionKey(userId)
    const sessionData = localStorage.getItem(sessionKey)
    
    console.log('🔍 Checking session for user:', userId)
    console.log('Session key:', sessionKey)
    console.log('Session data:', sessionData)
    
    if (!sessionData) {
      console.log('❌ No session data found')
      return false
    }
    
    try {
      const { timestamp, loginTxHash } = JSON.parse(sessionData)
      const now = Date.now()
      const sessionAge = now - timestamp
      
      console.log('Session details:', {
        timestamp: new Date(timestamp).toLocaleString(),
        loginTxHash,
        sessionAge: Math.round(sessionAge / 1000) + 's',
        maxAge: '3600s (1 hour)'
      })
      
      // Session is active if it's less than 1 hour old and has a login transaction
      const isActive = sessionAge < 3600000 && loginTxHash // 1 hour
      
      console.log('Session active:', isActive)
      
      if (!isActive) {
        // Clean up expired session
        console.log('🧹 Cleaning up expired session')
        localStorage.removeItem(sessionKey)
      }
      
      return isActive
    } catch (error) {
      // Clean up corrupted session data
      console.log('🧹 Cleaning up corrupted session data:', error)
      localStorage.removeItem(sessionKey)
      return false
    }
  }, [getSessionKey])

  const markSessionAsActive = useCallback((userId: string, txHash: string) => {
    const sessionKey = getSessionKey(userId)
    const sessionData = {
      timestamp: Date.now(),
      loginTxHash: txHash,
      userId
    }
    localStorage.setItem(sessionKey, JSON.stringify(sessionData))
    console.log('✅ Session marked as active for user:', userId)
  }, [getSessionKey])

  const clearSession = useCallback((userId: string) => {
    const sessionKey = getSessionKey(userId)
    localStorage.removeItem(sessionKey)
    console.log('🧹 Session cleared for user:', userId)
  }, [getSessionKey])

  // Simple duplicate prevention - only prevent if login happened very recently (< 30 seconds)
  const isRecentDuplicate = useCallback(() => {
    const now = Date.now()
    const timeSinceLastLogin = now - lastLoginTimeRef.current
    return timeSinceLastLogin < 30000 // 30 seconds
  }, [])

  // Event handling callback
  const handleBlockchainEvent = useCallback((event: any) => {
    console.log('📡 Received blockchain event:', event)
    
    // Validate event data
    if (!event || !event.type || !event.uid) {
      console.warn('Invalid event data received:', event)
      return
    }
    
    // Add to recent events
    setState(prev => ({
      ...prev,
      recentEvents: [event, ...prev.recentEvents.slice(0, 49)] // Keep last 50 events
    }))

    // If it's for the current user, add to user events
    if (user && event.uid === user.id) {
      setState(prev => ({
        ...prev,
        userEvents: [event, ...prev.userEvents]
      }))
    }
  }, [user])

  // Start event listening
  const startEventListening = useCallback(async () => {
    if (!state.isInitialized) return

    try {
      logger.startEventListening(handleBlockchainEvent)
      console.log('✅ Started listening to blockchain events')
    } catch (error) {
      console.error('❌ Failed to start event listening:', error)
    }
  }, [state.isInitialized, logger, handleBlockchainEvent])

  // Fetch user events
  const fetchUserEvents = useCallback(async () => {
    if (!user || !state.isInitialized) return

    try {
      const events = await logger.getUserEvents(user.id)
      setState(prev => ({ ...prev, userEvents: events }))
      return events
    } catch (error) {
      console.error('❌ Failed to fetch user events:', error)
      return []
    }
  }, [user, state.isInitialized, logger])

  // Fetch recent events
  const fetchRecentEvents = useCallback(async () => {
    if (!state.isInitialized) return

    try {
      const events = await logger.getRecentEvents(100) // Last 100 blocks
      setState(prev => ({ ...prev, recentEvents: events }))
      return events
    } catch (error) {
      console.error('❌ Failed to fetch recent events:', error)
      return []
    }
  }, [state.isInitialized, logger])

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

      // MOST IMPORTANT: Check if user is already logged in on the blockchain
      const isAlreadyLoggedIn = await logger.isUserLoggedIn(user.id)
      if (isAlreadyLoggedIn) {
        console.log('🔄 User is already logged in on blockchain, skipping login transaction')
        // Mark session as active to prevent future attempts
        markSessionAsActive(user.id, 'existing-session')
        return
      }

      // Check if there's already an active session
      if (isSessionActive(user.id)) {
        console.log('🔄 Active session found, skipping login transaction')
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
      
      if (txHash) {
        console.log('✅ Auto-login logged:', txHash)
        
        // Mark session as active
        markSessionAsActive(user.id, txHash)
        
        // Record the login time
        lastLoginTimeRef.current = Date.now()
        
        await fetchUserLogs()
      }

    } catch (error: any) {
      console.error('❌ Auto-login failed:', error)
      setState(prev => ({ ...prev, error: `Auto-login failed: ${error.message}` }))
    } finally {
      isProcessingRef.current = false
    }
  }, [user, state.isInitialized, logger, fetchUserLogs, isRecentDuplicate, isSessionActive, markSessionAsActive])

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
      
      if (txHash) {
        console.log('✅ Auto-logout logged:', txHash)
      }

      // Clear the session
      clearSession(user.id)

      // Reset login time
      lastLoginTimeRef.current = 0

      await fetchUserLogs()

    } catch (error: any) {
      console.error('❌ Auto-logout failed:', error)
      // Don't set error state for logout as user is leaving
    } finally {
      isProcessingRef.current = false
    }
  }, [user, state.isInitialized, logger, fetchUserLogs, clearSession])

  // Initialize on mount
  useEffect(() => {
    initializeLogger()
  }, [initializeLogger])

  // Start event listening when initialized
  useEffect(() => {
    if (state.isInitialized) {
      startEventListening()
      fetchRecentEvents()
      
      // Cleanup on unmount
      return () => {
        logger.stopEventListening()
      }
    }
  }, [state.isInitialized, startEventListening, fetchRecentEvents, logger])

  // Fetch logs when user changes
  useEffect(() => {
    if (authenticated && user && state.isInitialized) {
      fetchUserLogs()
      fetchUserEvents()
    }
  }, [authenticated, user, state.isInitialized, fetchUserLogs, fetchUserEvents])

  // Authentication detection with better debugging
  useEffect(() => {
    console.log('🔍 Auth effect triggered:', {
      ready,
      initialized: state.isInitialized,
      authenticated,
      user: user?.id,
      prevProcessed: prevAuthenticatedRef.current
    })

    if (!ready || !state.isInitialized || !authenticated || !user) {
      console.log('❌ Conditions not met, skipping')
      return
    }

    // Check if we already processed this user in this session
    const currentUserId = user.id
    const lastProcessedUser = sessionKeyRef.current
    
    if (prevAuthenticatedRef.current && lastProcessedUser === currentUserId) {
      console.log('✅ Already processed this user in current session, skipping')
      return
    }

    console.log('🔍 Processing authentication for user:', currentUserId)
    
    // Mark as processed
    prevAuthenticatedRef.current = true
    sessionKeyRef.current = currentUserId

    // Small delay to ensure everything is ready
    setTimeout(async () => {
      try {
        const exists = await logger.userExists(currentUserId)
        console.log('User exists in blockchain:', exists)
        
        if (!exists) {
          // New user - auto signup
          console.log('🔍 New user detected, auto-signup...')
          await autoLogSignup()
        } else {
          // Existing user - check if login is needed
          console.log('🔍 Existing user detected, checking if login needed...')
          await autoLogLogin()
        }
      } catch (error) {
        console.error('Error in authentication processing:', error)
      }
    }, 2000)
  }, [ready, authenticated, user, state.isInitialized, logger, autoLogSignup, autoLogLogin])

  // Handle logout
  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current
    const isNowAuthenticated = authenticated
    
    console.log('🔍 Logout check:', {
      wasAuthenticated,
      isNowAuthenticated,
      user: user?.id
    })

    if (wasAuthenticated && !isNowAuthenticated && user) {
      console.log('🔍 User logout detected for:', user.id)
      autoLogLogout()
      
      // Reset for next session
      prevAuthenticatedRef.current = false
      sessionKeyRef.current = ''
      lastLoginTimeRef.current = 0
    }
  }, [authenticated, user, autoLogLogout])

  // Reset refs when user changes
  useEffect(() => {
    if (user) {
      hasLoggedSignupRef.current = false
      isProcessingRef.current = false
      sessionKeyRef.current = getSessionKey(user.id)
      // Don't reset isInitialLoadRef here - let it be handled by auth detection
    }
  }, [user?.id, getSessionKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset all refs on unmount
      lastLoginTimeRef.current = 0
      isProcessingRef.current = false
      
      // Clear session if user logs out
      if (user) {
        clearSession(user.id)
      }
    }
  }, [user, clearSession])

  // Clear session when user becomes unauthenticated
  useEffect(() => {
    if (!authenticated && user) {
      clearSession(user.id)
    }
  }, [authenticated, user, clearSession])

  return {
    ...state,
    // Manual logging functions (for testing/debugging)
    logSignup,
    logLogin,
    logLogout,
    // Event tracking functions
    fetchUserEvents,
    fetchRecentEvents,
    startEventListening,
    // Utility functions
    fetchUserLogs,
    userExistsInBlockchain,
    testConnection,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}