import { useState } from 'react'
import { useSimpleAuth } from '../../hooks/useSimpleAuth'

export function WalletInfo() {
  const { authenticated, user, embeddedWallet, apiCall } = useSimpleAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  if (!authenticated || !user) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h3>
          <p className="text-gray-600 mb-6">Sign in to access your digital wallet and start buying tickets</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Ready to connect
          </div>
        </div>
      </div>
    )
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

  const displayName = user.email || user.phone || user.google || user.apple || 'User'
  const initials = displayName.split('@')[0].slice(0, 2).toUpperCase()

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
        <p className="text-gray-600">Your digital wallet is ready</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/50 rounded-2xl p-4 border border-white/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Account</span>
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              Connected
            </span>
          </div>
          <p className="text-gray-900 font-medium capitalize">
            {user.loginMethod} • {displayName.split('@')[0]}
          </p>
        </div>

        {embeddedWallet && (
          <div className="bg-white/50 rounded-2xl p-4 border border-white/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Wallet Address</span>
              <button
                onClick={() => navigator.clipboard.writeText(embeddedWallet.address)}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                Copy
              </button>
            </div>
            <p className="text-gray-900 font-mono text-sm break-all">
              {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-sm font-medium text-green-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Wallet Auto-Created
            </span>
          </div>

          <button
            onClick={testApiCall}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Testing Connection...
              </span>
            ) : (
              'Test API Connection'
            )}
          </button>

          {profileData && (
            <div className="mt-4 p-4 bg-gray-900/5 backdrop-blur-sm rounded-2xl border border-gray-200/50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">API Response:</h4>
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}