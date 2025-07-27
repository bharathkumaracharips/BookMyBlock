// Owner Dashboard Authentication Utilities

export const clearOwnerAuth = () => {
  // Clear Privy owner session data
  localStorage.removeItem('privy:owner:session')
  localStorage.removeItem('privy:owner:token')
  localStorage.removeItem('privy:owner:user')
  
  // Clear any other owner-specific auth data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('privy:owner') || key.includes('owner:auth')) {
      localStorage.removeItem(key)
    }
  })
  
  console.log('Owner authentication data cleared')
}

export const getAuthStorageKey = () => 'privy:owner:session'