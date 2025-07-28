/**
 * Simple Authentication Hook - Singleton Pattern
 * 
 * Single source of truth for authentication across the entire app.
 * Prevents multiple instances from running simultaneously.
 */

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BlockchainLogger } from '../services/blockchainLogger'

// Singleton instance to prevent multiple authentication processing
class AuthenticationManager {
  private static instance: AuthenticationManager
  private isProcessing = false
  private currentUserId: string | null = null
  private logger: BlockchainLogger | null = null
  private processingTimeout: NodeJS.Timeout | null = null
  private processedUsers: Set<string> = new Set()

  private constructor() {}

  static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager()
    }
    return AuthenticationManager.instance
  }

  async initializeLogger(): Promise<boolean> {
    if (this.logger) return true
    
    try {
      this.logger = new BlockchainLogger()
      const success = await this.logger.initialize()
      return success
    } catch (error) {
      console.error('Failed to initialize blockchain logger:', error)
      return false
    }
  }

  // Check if user is already logged in on blockchain
  async isUserLoggedInOnBlockchain(userId: string): Promise<boolean> {
    if (!this.logger) {
      const success = await this.initializeLogger()
      if (!success) return false
    }

    // Ensure logger is initialized
    if (!this.logger) {
      console.error('Blockchain logger not initialized')
      return false
    }

    try {
      const exists = await this.logger.userExists(userId)
      if (!exists) return false
      
      return await this.logger.isUserLoggedIn(userId)
    } catch (error) {
      console.error('Failed to check blockchain login status:', error)
      return false
    }
  }

  // Check if user has been processed in this session
  isUserProcessed(userId: string): boolean {
    return this.processedUsers.has(userId)
  }

  // Mark user as processed
  markUserProcessed(userId: string): void {
    this.processedUsers.add(userId)
  }

  // Clear processed users (for logout)
  clearProcessedUsers(): void {
    this.processedUsers.clear()
  }

  async processAuthentication(userId: string, walletAddress: string): Promise<string | null> {
    // Prevent multiple simultaneous processing
    if (this.isProcessing) {
      console.log('🔄 Authentication already in progress, skipping:', userId)
      return null
    }

    // Prevent processing the same user multiple times
    if (this.currentUserId === userId) {
      console.log('🔄 User already being processed, skipping:', userId)
      return null
    }

    // Check if user has already been processed in this session
    if (this.isUserProcessed(userId)) {
      console.log('🔄 User already processed in this session, skipping:', userId)
      return null
    }

    this.isProcessing = true
    this.currentUserId = userId

    // Set a timeout to prevent stuck processing
    this.processingTimeout = setTimeout(() => {
      console.log('⏰ Processing timeout, clearing state')
      this.isProcessing = false
      this.currentUserId = null
    }, 30000) // 30 seconds timeout

    try {
      console.log('🚀 Starting authentication processing for user:', userId)
      
      if (!this.logger) {
        const success = await this.initializeLogger()
        if (!success) {
          throw new Error('Failed to initialize blockchain logger')
        }
      }

      // Ensure logger is initialized
      if (!this.logger) {
        throw new Error('Blockchain logger not initialized')
      }

      // Check if user exists in blockchain
      const userExists = await this.logger.userExists(userId)
      
      if (!userExists) {
        // New user - create signup transaction
        console.log('🆕 New user detected, creating signup transaction...')
        const txHash = await this.logger.logSignup(userId, walletAddress)
        console.log('✅ Signup transaction created:', txHash)
        this.markUserProcessed(userId)
        return txHash
      } else {
        // Check if user is already logged in on blockchain
        const isAlreadyLoggedIn = await this.isUserLoggedInOnBlockchain(userId)
        
        if (isAlreadyLoggedIn) {
          console.log('ℹ️ User already logged in on blockchain, skipping login transaction')
          this.markUserProcessed(userId)
          return null
        } else {
          // User exists but not logged in - create login transaction
          console.log('🔑 Existing user login, creating login transaction for security audit...')
          const txHash = await this.logger.logLogin(userId)
          console.log('✅ Login transaction created:', txHash)
          this.markUserProcessed(userId)
          return txHash
        }
      }
      
    } catch (error: any) {
      console.error('❌ Authentication processing failed:', error)
      throw error
    } finally {
      this.isProcessing = false
      this.currentUserId = null
      if (this.processingTimeout) {
        clearTimeout(this.processingTimeout)
        this.processingTimeout = null
      }
    }
  }

  async processLogout(userId: string): Promise<string | null> {
    if (!this.logger) {
      console.log('Logger not initialized, skipping logout')
      return null
    }

    try {
      // Check if user is logged in on blockchain
      const isLoggedIn = await this.logger.isUserLoggedIn(userId)
      
      if (isLoggedIn) {
        console.log('🚪 User logout, creating logout transaction...')
        const txHash = await this.logger.logLogout(userId)
        console.log('✅ Logout transaction created:', txHash)
        
        // Clear user from processed list on logout
        this.processedUsers.delete(userId)
        
        return txHash
      } else {
        console.log('ℹ️ User already logged out, no transaction needed')
        
        // Clear user from processed list even if no transaction
        this.processedUsers.delete(userId)
        
        return null
      }
    } catch (error: any) {
      console.error('❌ Logout failed:', error)
      throw error
    }
  }

  getLogger(): BlockchainLogger | null {
    return this.logger
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing
  }
}

// Global authentication manager instance
const authManager = AuthenticationManager.getInstance()

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

  // Handle authentication changes
  useEffect(() => {
    if (!ready || !authenticated || !user || hasProcessedAuth) {
      return
    }

    // Prevent processing the same user multiple times
    if (lastProcessedUserId === user.id) {
      console.log('🔄 User already processed, skipping:', user.id)
      return
    }

    // Check if authentication manager is already processing
    if (authManager.isCurrentlyProcessing()) {
      console.log('🔄 Authentication manager is busy, skipping:', user.id)
      return
    }

    // Check if user has already been processed in this session
    if (authManager.isUserProcessed(user.id)) {
      console.log('🔄 User already processed in this session, skipping:', user.id)
      setHasProcessedAuth(true)
      setLastProcessedUserId(user.id)
      return
    }

    const processAuth = async () => {
      if (!embeddedWallet?.address) {
        console.log('Waiting for wallet...')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const txHash = await authManager.processAuthentication(user.id, embeddedWallet.address)
        
        if (txHash) {
          setHasProcessedAuth(true)
          setLastProcessedUserId(user.id)
        } else {
          // Even if no transaction was created (user already logged in), mark as processed
          setHasProcessedAuth(true)
          setLastProcessedUserId(user.id)
        }
        
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
    
  }, [ready, authenticated, user, embeddedWallet, hasProcessedAuth])

  // Reset processing state when user changes
  useEffect(() => {
    if (user && lastProcessedUserId && lastProcessedUserId !== user.id) {
      setHasProcessedAuth(false)
      setLastProcessedUserId(null)
    }
  }, [user?.id, lastProcessedUserId])

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (!user) {
      await logout()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authManager.processLogout(user.id)
      
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
  }, [user, logout])

  // Get user blockchain status
  const getUserStatus = useCallback(async () => {
    const logger = authManager.getLogger()
    if (!logger || !user) return null
    
    try {
      const userLogs = await logger.getUserLogs(user.id)
      return userLogs
    } catch (error) {
      console.error('Failed to get user status:', error)
      return null
    }
  }, [user])

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