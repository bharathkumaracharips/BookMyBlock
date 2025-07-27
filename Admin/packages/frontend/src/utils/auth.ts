// Admin Dashboard Authentication Utilities

export const clearAdminAuth = () => {
  // Clear Privy admin session data
  localStorage.removeItem('privy:admin:session')
  localStorage.removeItem('privy:admin:token')
  localStorage.removeItem('privy:admin:user')
  
  // Clear any other admin-specific auth data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('privy:admin') || key.includes('admin:auth')) {
      localStorage.removeItem(key)
    }
  })
  
  console.log('Admin authentication data cleared')
}

export const getAuthStorageKey = () => 'privy:admin:session'