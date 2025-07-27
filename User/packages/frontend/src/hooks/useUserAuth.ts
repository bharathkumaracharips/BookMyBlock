import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useAuth } from './useAuth'
import { UserAuthContract, UserDetails } from '../contracts/UserAuth'

export function useUserAuth() {
  const { authenticated, user, embeddedWallet } = useAuth()
  const [userAuthContract, setUserAuthContract] = useState<UserAuthContract | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize contract when wallet is available
  useEffect(() => {
    if (embeddedWallet && authenticated) {
      try {
        // For development with Ganache, use JsonRpcProvider
        const isDevelopment = import.meta.env.DEV
        let provider
        
        if (isDevelopment) {
          // Connect to Ganache for development
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545')
        } else {
          // Use browser provider for production
          provider = new ethers.BrowserProvider(window.ethereum)
        }
        
        provider.getSigner().then(signer => {
          const contract = new UserAuthContract(signer)
          setUserAuthContract(contract)
        }).catch(err => {
          console.error('Failed to get signer:', err)
          setError('Failed to connect to wallet')
        })
      } catch (err) {
        console.error('Failed to initialize UserAuth contract:', err)
        setError('Failed to initialize contract')
      }
    }
  }, [embeddedWallet, authenticated])

  // Load user details when contract is ready
  useEffect(() => {
    if (userAuthContract && user?.id) {
      loadUserDetails()
    }
  }, [userAuthContract, user?.id])

  const loadUserDetails = async () => {
    if (!userAuthContract || !user?.id) return

    setLoading(true)
    setError(null)

    try {
      const exists = await userAuthContract.userExists(user.id)
      if (exists) {
        const details = await userAuthContract.getUserDetails(user.id)
        setUserDetails(details)
      } else {
        setUserDetails(null)
      }
    } catch (err) {
      console.error('Failed to load user details:', err)
      setError('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const signupUser = async () => {
    if (!userAuthContract || !user?.id || !embeddedWallet?.address) {
      throw new Error('Contract or user data not available')
    }

    setLoading(true)
    setError(null)

    try {
      const tx = await userAuthContract.signup(user.id, embeddedWallet.address)
      await tx.wait() // Wait for transaction confirmation
      
      // Reload user details after successful signup
      await loadUserDetails()
      
      return tx
    } catch (err) {
      console.error('Signup failed:', err)
      setError('Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginUser = async () => {
    if (!userAuthContract || !user?.id) {
      throw new Error('Contract or user data not available')
    }

    setLoading(true)
    setError(null)

    try {
      const tx = await userAuthContract.login(user.id)
      await tx.wait() // Wait for transaction confirmation
      
      // Reload user details after successful login
      await loadUserDetails()
      
      return tx
    } catch (err) {
      console.error('Login failed:', err)
      setError('Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = async () => {
    if (!userAuthContract || !user?.id) {
      throw new Error('Contract or user data not available')
    }

    setLoading(true)
    setError(null)

    try {
      const tx = await userAuthContract.logout(user.id)
      await tx.wait() // Wait for transaction confirmation
      
      // Reload user details after successful logout
      await loadUserDetails()
      
      return tx
    } catch (err) {
      console.error('Logout failed:', err)
      setError('Logout failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // Contract instance
    userAuthContract,
    
    // User data
    userDetails,
    isSignedUp: userDetails?.isSignedUp || false,
    isLoggedIn: userDetails?.isLoggedIn || false,
    loginCount: userDetails?.loginCount || 0,
    
    // Actions
    signupUser,
    loginUser,
    logoutUser,
    refreshUserDetails: loadUserDetails,
    
    // State
    loading,
    error,
    
    // Helper functions
    canSignup: authenticated && user && embeddedWallet && !userDetails?.isSignedUp,
    canLogin: authenticated && user && userDetails?.isSignedUp && !userDetails?.isLoggedIn,
    canLogout: authenticated && user && userDetails?.isLoggedIn
  }
}