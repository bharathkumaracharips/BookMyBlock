import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
}

export function LocationFinder() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reverse geocoding to get city name
  const getCityFromCoords = async (lat: number, lon: number): Promise<{ city?: string; country?: string }> => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      const data = await response.json()
      return {
        city: data.city || data.locality || 'Unknown City',
        country: data.countryName || 'Unknown Country'
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {}
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const locationInfo = await getCityFromCoords(latitude, longitude)
        
        setLocation({
          latitude,
          longitude,
          ...locationInfo
        })
        setLoading(false)
      },
      (error) => {
        setLoading(false)
        setError('Location access denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const clearLocation = () => {
    setLocation(null)
    setError(null)
  }

  if (!location) {
    return (
      <button
        onClick={requestLocation}
        disabled={loading}
        className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200 group"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        <span className="text-sm font-medium whitespace-nowrap">
          {loading ? 'Finding...' : 'Near me'}
        </span>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-slate-300">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-sm font-medium text-white whitespace-nowrap">
        {location.city || 'Current Location'}
      </span>
      <button
        onClick={clearLocation}
        className="ml-1 p-1 hover:bg-slate-700 rounded-full transition-colors duration-200"
      >
        <svg className="w-3 h-3 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}