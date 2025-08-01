import { useState, useEffect } from 'react'
import { LocationService, Theater, Event, LocationData } from '../services/locationService'

export interface UseLocationTheatersReturn {
  theaters: Theater[]
  events: Event[]
  userLocation: LocationData | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  setUserLocation: (location: LocationData) => void
  searchTheaters: (query: string) => Promise<Theater[]>
}

export function useLocationTheaters(): UseLocationTheatersReturn {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [userLocation, setUserLocationState] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data based on user location
  const loadLocationData = async (location: LocationData | null) => {
    if (!location) {
      console.log('📍 No location provided, loading all theaters...')
      try {
        setLoading(true)
        setError(null)
        
        // Load all theaters if no location
        const allTheaters = await LocationService.searchTheaters('')
        setTheaters(allTheaters)
        setEvents([])
        
      } catch (err) {
        console.error('❌ Error loading all theaters:', err)
        setError('Failed to load theaters')
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('📍 Loading theaters and events for location:', location)
      
      // Load theaters and events in parallel
      const [theatersData, eventsData] = await Promise.all([
        LocationService.getTheatersForUser(location),
        LocationService.getEventsForUser(location)
      ])
      
      setTheaters(theatersData)
      setEvents(eventsData)
      
      console.log(`✅ Loaded ${theatersData.length} theaters and ${eventsData.length} events`)
      
    } catch (err) {
      console.error('❌ Error loading location data:', err)
      setError('Failed to load theaters and events for your location')
    } finally {
      setLoading(false)
    }
  }

  // Set user location and reload data
  const setUserLocation = async (location: LocationData) => {
    console.log('📍 User location updated:', location)
    setUserLocationState(location)
    await loadLocationData(location)
  }

  // Refresh current data
  const refreshData = async () => {
    console.log('🔄 Refreshing location data...')
    await loadLocationData(userLocation)
  }

  // Search theaters
  const searchTheaters = async (query: string): Promise<Theater[]> => {
    try {
      console.log(`🔍 Searching theaters: ${query}`)
      return await LocationService.searchTheaters(query)
    } catch (err) {
      console.error('❌ Error searching theaters:', err)
      return []
    }
  }

  // Try to get user's current location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        console.log('🌍 Initializing user location...')
        
        // Try to get current location
        const currentLocation = await LocationService.getCurrentLocation()
        
        if (currentLocation) {
          console.log('✅ Current location detected:', currentLocation)
          setUserLocationState(currentLocation)
          await loadLocationData(currentLocation)
        } else {
          console.log('📍 No location detected, loading all theaters...')
          await loadLocationData(null)
        }
        
      } catch (err) {
        console.error('❌ Error initializing location:', err)
        setError('Failed to detect your location')
        await loadLocationData(null)
      }
    }

    initializeLocation()
  }, [])

  return {
    theaters,
    events,
    userLocation,
    loading,
    error,
    refreshData,
    setUserLocation,
    searchTheaters
  }
}