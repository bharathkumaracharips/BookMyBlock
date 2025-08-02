import React, { createContext, useContext, useState, useEffect } from 'react'
import { LocationService, LocationData } from '../services/locationService'

interface LocationContextType {
  userLocation: LocationData | null
  setUserLocation: (location: LocationData) => void
  loading: boolean
  error: string | null
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  console.log('🌍 LocationProvider: Component rendered/re-rendered')
  
  const [userLocation, setUserLocationState] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  console.log('🌍 LocationProvider: Initial state:', { userLocation, loading, error })

  // Initialize location on mount - try multiple times if needed
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 3
    
    const initializeLocation = async () => {
      attempts++
      try {
        console.log(`🌍 LocationContext: Initializing location (attempt ${attempts}/${maxAttempts})...`)
        
        // Try to get current location with retry logic
        const currentLocation = await LocationService.getCurrentLocation('LocationContext')
        
        console.log('🌍 LocationContext: LocationService returned:', JSON.stringify(currentLocation))
        
        if (currentLocation) {
          console.log('✅ LocationContext: Location detected:', JSON.stringify(currentLocation))
          setUserLocationState(currentLocation)
          setError(null)
          console.log('✅ LocationContext: Location state updated successfully')
        } else if (attempts < maxAttempts) {
          console.log(`📍 LocationContext: No location detected, retrying in 2 seconds (attempt ${attempts}/${maxAttempts})...`)
          setTimeout(initializeLocation, 2000)
          return
        } else {
          console.log('📍 LocationContext: No location detected after all attempts')
          setError('Could not detect your location. Please select your city manually.')
        }
        
      } catch (err) {
        console.error(`❌ LocationContext: Error on attempt ${attempts}:`, err)
        if (attempts < maxAttempts) {
          console.log(`🔄 LocationContext: Retrying in 2 seconds...`)
          setTimeout(initializeLocation, 2000)
          return
        } else {
          setError('Failed to detect your location')
        }
      } finally {
        if (attempts >= maxAttempts || userLocation) {
          console.log('🔄 LocationContext: Setting loading to false')
          setLoading(false)
        }
      }
    }

    console.log('🌍 LocationContext: Starting automatic location detection...')
    initializeLocation()
  }, [])

  const setUserLocation = (location: LocationData) => {
    console.log('📍 LocationContext: setUserLocation called with:', JSON.stringify(location))
    console.log('📍 LocationContext: Previous location was:', JSON.stringify(userLocation))
    
    setUserLocationState(location)
    setError(null)
    
    console.log('✅ LocationContext: setUserLocationState called, new state should be:', JSON.stringify(location))
    
    // Force a console log after state update
    setTimeout(() => {
      console.log('🔍 LocationContext: State after timeout:', JSON.stringify(userLocation))
    }, 100)
  }

  // Debug: Log current state
  useEffect(() => {
    console.log('🌍 LocationContext state:', { userLocation, loading, error })
  }, [userLocation, loading, error])

  return (
    <LocationContext.Provider value={{
      userLocation,
      setUserLocation,
      loading,
      error
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}