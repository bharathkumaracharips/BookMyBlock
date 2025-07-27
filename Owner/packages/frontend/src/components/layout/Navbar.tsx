import { LoginButton } from '../auth/LoginButton'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [currentLocation, setCurrentLocation] = useState<string>('Detecting location...')

  useEffect(() => {
    // Auto-detect current location using HTML5 Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            
            // Use free OpenStreetMap reverse geocoding to get city name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            )
            
            if (response.ok) {
              const data = await response.json()
              const city = data.address?.city || 
                          data.address?.town || 
                          data.address?.village || 
                          data.address?.municipality ||
                          'Current Location'
              setCurrentLocation(city)
            } else {
              setCurrentLocation('Current Location')
            }
          } catch (error) {
            console.error('Error getting location:', error)
            setCurrentLocation('Location unavailable')
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setCurrentLocation('Location access denied')
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 300000 
        }
      )
    } else {
      setCurrentLocation('Location not supported')
    }
  }, [])
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Premium dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">BookMyBlock</span>
          </div>

          {/* Center - Integrated Search with Location */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              {/* Main search container */}
              <div className="relative flex items-center bg-slate-800/50 border border-slate-600/50 rounded-2xl backdrop-blur-sm hover:border-slate-500/50 transition-all duration-300 group">

                {/* Location section */}
                <div className="flex items-center px-4 py-3 border-r border-slate-600/50 min-w-0">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-white truncate">
                      {currentLocation}
                    </span>
                    {currentLocation === 'Detecting location...' && (
                      <div className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    )}
                  </div>
                </div>

                {/* Search input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search events, venues, artists..."
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                  />
                </div>

                {/* Search button */}
                <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-r-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium">Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Auth */}
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  )
}