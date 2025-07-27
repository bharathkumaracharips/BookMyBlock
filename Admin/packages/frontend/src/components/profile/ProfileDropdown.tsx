import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function ProfileDropdown() {
  const { authenticated, user, embeddedWallet, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging for Admin dashboard
  useEffect(() => {
    console.log('🔧 Admin ProfileDropdown Debug:', {
      authenticated,
      hasUser: !!user,
      userId: user?.id,
      hasEmbeddedWallet: !!embeddedWallet,
      walletAddress: embeddedWallet?.address,
      walletType: embeddedWallet?.walletClientType
    })
  }, [authenticated, user, embeddedWallet])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!authenticated || !user) return null

  const displayName = user.email || user.phone || user.google || user.apple || 'User'
  const initials = displayName.split('@')[0].slice(0, 2).toUpperCase()
  const userName = displayName.split('@')[0]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/30 transition-all duration-200"
      >
        {/* User Avatar */}
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
        </div>
        
        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white">{userName}</p>
          <p className="text-xs text-slate-400 capitalize">{user.loginMethod}</p>
        </div>

        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50">
          {/* User Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {initials}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{userName}</h3>
                <p className="text-sm text-slate-400 capitalize">{user.loginMethod} Account</p>
              </div>
            </div>

            {/* User ID */}
            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">User ID</span>
                <button
                  onClick={() => copyToClipboard(user.id)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-white font-mono mt-1">
                {user.id.slice(0, 8)}...{user.id.slice(-8)}
              </p>
            </div>

            {/* Wallet Address */}
            {embeddedWallet && (
              <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Wallet Address</span>
                  <button
                    onClick={() => copyToClipboard(embeddedWallet.address)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-white font-mono mt-1">
                  {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-6)}
                </p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* My Bookings */}
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">My Bookings</p>
                <p className="text-xs text-slate-400">View and manage your tickets</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors duration-200">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">3</span>
                </div>
                <p className="text-xs text-slate-400">Event updates and alerts</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Rewards */}
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors duration-200">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-white">Rewards</p>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">₹250</span>
                </div>
                <p className="text-xs text-slate-400">Points and cashback</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Help & Support */}
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 group">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-200">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">Help & Support</p>
                <p className="text-xs text-slate-400">Get assistance and FAQs</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}