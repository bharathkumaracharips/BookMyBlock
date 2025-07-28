import React from 'react'
import { useSimpleAuth } from '../../hooks/useSimpleAuth'
import { ProfileDropdown } from '../profile/ProfileDropdown'

export function LoginButton() {
  const { ready, authenticated, login, isLoading } = useSimpleAuth()

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (authenticated) {
    return (
      <div className="flex items-center space-x-2">
        {isLoading && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        )}
        <ProfileDropdown />
      </div>
    )
  }

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className={`px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Signing In...
        </div>
      ) : (
        'Sign In'
      )}
    </button>
  )
}