import React, { useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useActivityLogger } from '../hooks/useActivityLogger'

export const ActivityLogger: React.FC = () => {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const {
    isLoading,
    error,
    userLogs,
    isInitialized,
    userExistsInBlockchain,
    testConnection,
    clearError
  } = useActivityLogger()

  const [userExists, setUserExists] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)

  // Check if user exists in blockchain
  useEffect(() => {
    if (authenticated && user && isInitialized) {
      userExistsInBlockchain().then(setUserExists)
    }
  }, [authenticated, user, isInitialized, userExistsInBlockchain])

  // Test connection on mount
  useEffect(() => {
    testConnection().then(setConnectionStatus)
  }, [testConnection])

  const handlePrivyLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Privy login failed:', error)
    }
  }

  const handlePrivyLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Privy logout failed:', error)
    }
  }



  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">User Authentication</h2>
        <p className="text-gray-600 mb-4">
          Please authenticate with Privy. Your activities will be automatically logged to the blockchain.
        </p>
        <button
          onClick={handlePrivyLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Login with Privy
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Automatic Activity Logger</h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 rounded" style={{
        backgroundColor: connectionStatus ? '#f0f9ff' : '#fef2f2',
        borderColor: connectionStatus ? '#3b82f6' : '#ef4444',
        borderWidth: '1px'
      }}>
        <div className="text-sm font-semibold">
          Ganache Connection: {connectionStatus ? '✅ Connected' : '❌ Disconnected'}
        </div>
        {!connectionStatus && (
          <div className="text-xs text-red-600 mt-1">
            Make sure Ganache is running on http://127.0.0.1:7545
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Privy User Information</h3>
        <div className="space-y-1 text-sm">
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email?.address || 'Not provided'}</p>
          <p><strong>Wallets:</strong> {wallets.length}</p>
          <p><strong>Logger Status:</strong> {isInitialized ? '✅ Ready' : '❌ Not Ready'}</p>
        </div>
      </div>

      {/* Auto-Logging Status */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="text-lg font-semibold mb-2 text-green-800">🤖 Automatic Logging Status</h3>
        <div className="space-y-1 text-sm text-green-700">
          <p><strong>Mode:</strong> Automatic blockchain logging enabled</p>
          <p><strong>Triggers:</strong> Privy authentication events</p>
          <p><strong>Processing:</strong> {isLoading ? '🔄 Logging transaction...' : '✅ Ready'}</p>
          <p><strong>Duplicate Prevention:</strong> 30-second cooldown between logins</p>
        </div>
      </div>

      {/* Blockchain Activity Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Blockchain Activity Logs</h3>
        <div className="space-y-1 text-sm">
          <p><strong>User Registered:</strong> {userExists ? '✅ Yes' : '❌ No'}</p>
          {userLogs && (
            <>
              <p><strong>Login Count:</strong> {userLogs.loginCount}</p>
              <p><strong>Last Action:</strong> {userLogs.lastAction}</p>
              <p><strong>Last Activity:</strong> {new Date(userLogs.lastTimestamp * 1000).toLocaleString()}</p>
              <p><strong>Signup Date:</strong> {new Date(userLogs.signupTimestamp * 1000).toLocaleString()}</p>
              <p><strong>Currently Logged In:</strong> {userLogs.isLoggedIn ? '✅ Yes' : '❌ No'}</p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">How it works:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Login Detection:</strong> Automatically detects Privy authentication</li>
            <li>• <strong>First Time Users:</strong> Creates blockchain signup record</li>
            <li>• <strong>Returning Users:</strong> Logs login activity with timestamp</li>
            <li>• <strong>Logout Detection:</strong> Logs logout when user signs out</li>
            <li>• <strong>Duplicate Prevention:</strong> 30-second cooldown prevents rapid duplicates</li>
          </ul>
        </div>

        <button
          onClick={handlePrivyLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout from Privy (Will Auto-Log to Blockchain)
        </button>
      </div>

      {/* Contract Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-xs">
        <h4 className="font-semibold mb-1">Automatic Blockchain Logging</h4>
        <p><strong>Mode:</strong> Fully automated - no manual intervention needed</p>
        <p><strong>Authentication:</strong> Handled by Privy</p>
        <p><strong>Logging:</strong> Automatic to Ganache blockchain</p>
        <p><strong>Contract:</strong> {import.meta.env.VITE_USER_AUTH_CONTRACT_ADDRESS}</p>
        <p><strong>Triggers:</strong> Privy login/logout events</p>
      </div>
    </div>
  )
}