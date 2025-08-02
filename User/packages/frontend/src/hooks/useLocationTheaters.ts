import { useState, useEffect } from 'react'
import { LocationService, Theater, Event, LocationData } from '../services/locationService'
import { useLocationContext } from '../contexts/LocationContext'

export interface UseLocationTheatersReturn {
  theaters: Theater[]
  events: Event[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  searchTheaters: (query: string) => Promise<Theater[]>
}

export function useLocationTheaters(): UseLocationTheatersReturn {
  const { userLocation } = useLocationContext()
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [events, setEvents] = useState<Event[]>([])
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

  // Load data when location changes
  useEffect(() => {
    loadLocationData(userLocation)
  }, [userLocation])

  return {
    theaters,
    events,
    loading,
    error,
    refreshData,
    searchTheaters
  }
}