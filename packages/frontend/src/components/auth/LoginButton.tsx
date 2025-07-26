import { useAuth } from '../../hooks/useAuth'

export function LoginButton() {
  const { ready, authenticated, login, logout, user } = useAuth()

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (authenticated && user) {
    const displayName = user.email || user.phone || user.google || user.apple || 'User'
    const initials = displayName.split('@')[0].slice(0, 2).toUpperCase()
    
    return (
      <div className="flex items-center space-x-3">
        {/* User Avatar */}
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
        </div>
        
        {/* User Info */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">Welcome back</p>
          <p className="text-xs text-slate-400 capitalize">{user.loginMethod}</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
    >
      Sign In
    </button>
  )
}