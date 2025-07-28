import { useState, useEffect, useCallback } from 'react'
import { useSimpleAuth } from './useSimpleAuth'

export function useUserAuth() {
  const { 
    authenticated, 
    user, 
    embeddedWallet, 
    login,
    logout,
    isLoading,
    error,
    clearError,
    getUserStatus
  } = useSimpleAuth()

  const [userDetails, setUserDetails] = useState<any>(null)

  // Load user details when authenticated
  useEffect(() => {
    if (authenticated && user) {
      getUserStatus().then(setUserDetails)
    } else {
      setUserDetails(null)
    }
  }, [authenticated, user, getUserStatus])

  // Refresh user details
  const refreshUserDetails = useCallback(async () => {
    if (authenticated && user) {
      const status = await getUserStatus()
      setUserDetails(status)
    }
  }, [authenticated, user, getUserStatus])

  // Simple auth actions (for backward compatibility)
  const signupUser = useCallback(async () => {
    // Signup is handled automatically by useSimpleAuth
    throw new Error('Signup is handled automatically when user first logs in')
  }, [])

  const loginUser = useCallback(async () => {
    // Login is handled automatically by useSimpleAuth
    return await login()
  }, [login])

  const logoutUser = useCallback(async () => {
    return await logout()
  }, [logout])

  return {
    // User data (backward compatibility)
    userDetails,
    isSignedUp: userDetails?.isSignedUp || false,
    isLoggedIn: userDetails?.isLoggedIn || false,
    loginCount: userDetails?.loginCount || 0,
    
    // Actions
    signupUser,
    loginUser,
    logoutUser,
    refreshUserDetails,
    
    // State
    loading: isLoading,
    error,
    
    // Helper functions (backward compatibility)
    canSignup: authenticated && user && embeddedWallet && !userDetails?.isSignedUp,
    canLogin: authenticated && user && userDetails?.isSignedUp && !userDetails?.isLoggedIn,
    canLogout: authenticated && user && userDetails?.isLoggedIn,
    
    // Clear errors
    clearError,
    
    // User info
    authenticated,
    user,
    embeddedWallet,
    
    // Deprecated (for backward compatibility)
    userAuthContract: null
  }
}