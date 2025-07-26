import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProviders } from './providers/PrivyProvider'
import { LoginButton } from './components/auth/LoginButton'
import { WalletInfo } from './components/wallet/WalletInfo'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BookMyBlock
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Decentralized Ticketing Platform
          </p>
          <p className="text-sm text-gray-500 mb-8">
            ✅ Frontend setup complete with Privy integration
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <LoginButton />
          </div>
          
          <WalletInfo />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Privy Integration Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Email & SMS login (no crypto knowledge needed)</li>
              <li>• Social login with Google & Apple</li>
              <li>• Automatic wallet creation for new users</li>
              <li>• Traditional wallet connect for advanced users</li>
              <li>• Seamless Web3 experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)