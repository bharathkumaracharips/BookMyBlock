import { useAuth } from '../../hooks/useAuth'

export function LoginButton() {
  const { ready, authenticated, login, logout, user } = useAuth()

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (authenticated && user) {
    const displayName = user.email || user.phone || user.google || user.apple || 'User'
    
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Welcome, {displayName}! ({user.loginMethod})
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={login}
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Sign In with Privy
      </button>
      <p className="text-xs text-gray-500 text-center">
        Email • SMS • Google • Apple • Wallet
      </p>
    </div>
  )
}