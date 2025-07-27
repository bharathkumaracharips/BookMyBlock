// User Dashboard Authentication Utilities

export const clearUserAuth = () => {
  // Clear Privy user session data
  localStorage.removeItem('privy:user:session')
  localStorage.removeItem('privy:user:token')
  localStorage.removeItem('privy:user:user')
  
  // Clear any other user-specific auth data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('privy:user') || key.includes('user:auth')) {
      localStorage.removeItem(key)
    }
  })
  
  console.log('User authentication data cleared')
}

export const getAuthStorageKey = () => 'privy:user:session'