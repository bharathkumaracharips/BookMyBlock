import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { PhoneInput } from '../ui/PhoneInput'
import { formatForSubmission } from '../../utils/phoneFormatter'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = usePrivy()
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'social'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleEmailLogin = async () => {
    if (!email) return
    setLoading(true)
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    if (!phone || !isPhoneValid) return
    
    setLoading(true)
    try {
      // Format phone number for Privy (+91XXXXXXXXXX)
      const formattedPhone = formatForSubmission(phone)
      console.log('Attempting SMS login with:', formattedPhone)
      
      await login()
    } catch (error) {
      console.error('SMS login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setLoading(true)
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Welcome to BookMyBlock</h2>
                  <p className="text-sm text-slate-400">Sign in to your account</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-6">
            <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'email'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveTab('phone')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'phone'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'social'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Social
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors duration-200"
                  />
                </div>
                <button
                  onClick={handleEmailLogin}
                  disabled={!email || loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Continue with Email'
                  )}
                </button>
              </div>
            )}

            {activeTab === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Number
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    onValidationChange={setIsPhoneValid}
                    disabled={loading}
                    placeholder="98765 43210"
                  />
                </div>
                
                {/* Info Text */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-slate-400">
                      We'll send you a verification code via SMS to complete your sign-in.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePhoneLogin}
                  disabled={!phone || !isPhoneValid || loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending code...</span>
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('apple')}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-slate-400">or connect wallet</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSocialLogin('wallet')}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Connect Wallet</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              By continuing, you agree to BookMyBlock's{' '}
              <a href="#" className="text-violet-400 hover:text-violet-300">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-violet-400 hover:text-violet-300">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}