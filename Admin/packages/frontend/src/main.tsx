import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProviders } from './providers/PrivyProvider'
import { Navbar } from './components/layout/Navbar'
import { HomePage } from './components/pages/HomePage'
import { PrivyDebug } from './components/debug/PrivyDebug'
import './index.css'

function App() {
  return (
    <div className="min-h-screen">
      <PrivyDebug />
      <Navbar />
      <HomePage />
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