import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProviders } from './providers/PrivyProvider'
import { Navbar } from './components/layout/Navbar'
import { HomePage } from './components/pages/HomePage'
import { EventDetailsPage } from './components/pages/EventDetailsPage'
import { PrivyDebug } from './components/debug/PrivyDebug'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <PrivyDebug />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:eventId" element={<EventDetailsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)