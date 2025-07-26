import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function WalletInfo() {
  const { authenticated, user, embeddedWallet, apiCall } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  if (!authenticated || !user) {
    return null
  }

  const testApiCall = async () => {
    setLoading(true)
    try {
      const response = await apiCall('/profile')
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      console.error('API call failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">Login Method</label>
          <p className="text-gray-900 capitalize">
            {user.loginMethod} {user.email || user.phone || user.google || user.apple}
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">User ID</label>
          <p className="text-gray-900 font-mono text-xs break-all">
            {user.id}
          </p>
        </div>
        
        {embeddedWallet && (
          <div>
            <label className="text-sm font-medium text-gray-500">Wallet Address</label>
            <p className="text-gray-900 font-mono text-xs break-all">
              {embeddedWallet.address}
            </p>
          </div>
        )}
        
        <div className="pt-2 space-y-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Wallet Created Automatically
          </span>
          
          <div>
            <button
              onClick={testApiCall}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Call'}
            </button>
          </div>
          
          {profileData && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <pre>{JSON.stringify(profileData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}