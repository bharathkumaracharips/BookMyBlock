import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export interface Theater {
  id: string
  name: string
  location: string
  pincode: string
  city: string
  state: string
  address: string
  screens: number
  totalSeats: number
  status: 'active' | 'pending' | 'inactive' | 'rejected'
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  pdfHash?: string
  ipfsUrls?: {
    pdf: string
  }
  distance?: number
}

export interface Event {
  id: string
  title: string
  description: string
  theaterId: string
  theaterName: string
  theaterLocation: string
  date: string
  time: string
  duration: number
  ticketPrice: number
  availableSeats: number
  totalSeats: number
  category: string
  imageUrl?: string
  trailerUrl?: string
  status: 'active' | 'cancelled' | 'completed'
}

export interface LocationData {
  latitude: number
  longitude: number
  city: string
  state?: string
  pincode?: string
  isCurrentLocation?: boolean
}

export class LocationService {
  private static api = axios.create({
    baseURL: `${API_BASE_URL}/theaters`,
    timeout: 10000
  })

  /**
   * Get user's current location using HTML5 Geolocation
   */
  static async getCurrentLocation(caller?: string): Promise<LocationData | null> {
    const callerId = caller || 'unknown'
    console.log(`🌍 LocationService.getCurrentLocation called by: ${callerId}`)
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn(`⚠️ [${callerId}] Geolocation is not supported by this browser`)
        resolve(null)
        return
      }

      // First try to get cached position if available
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            console.log(`🌍 [${callerId}] Getting location details for coordinates:`, { latitude, longitude })
            
            // Try multiple geocoding services for better pincode detection
            const locationData = await this.getLocationFromCoordinates(latitude, longitude)
            
            console.log(`✅ [${callerId}] Current location detected:`, locationData)
            resolve(locationData)

          } catch (error) {
            console.error(`❌ [${callerId}] Error getting location details:`, error)
            resolve({
              latitude,
              longitude,
              city: 'Current Location',
              isCurrentLocation: true
            })
          }
        },
        (error) => {
          console.warn(`⚠️ [${callerId}] Geolocation failed (${error.message}), trying with cached position...`)
          
          // Try again with less strict options
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              try {
                console.log(`🌍 [${callerId}] Got cached location:`, { latitude, longitude })
                const locationData = await this.getLocationFromCoordinates(latitude, longitude)
                console.log(`✅ [${callerId}] Cached location processed:`, locationData)
                resolve(locationData)
              } catch (err) {
                console.error(`❌ [${callerId}] Error processing cached location:`, err)
                resolve(null)
              }
            },
            (secondError) => {
              console.error(`❌ [${callerId}] All geolocation attempts failed:`, secondError)
              resolve(null)
            },
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 600000 // Accept 10-minute old position
            }
          )
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // Accept 5-minute old position
        }
      )
    })
  }

  /**
   * Get location details from coordinates using multiple geocoding services
   */
  private static async getLocationFromCoordinates(latitude: number, longitude: number): Promise<LocationData> {
    const geocodingServices = [
      // Service 1: BigDataCloud (free, no API key required)
      async () => {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        const data = await response.json()
        return {
          city: data.city || data.locality || data.localityInfo?.administrative?.[2]?.name,
          state: data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name,
          pincode: data.postcode || data.localityInfo?.postcode
        }
      },
      
      // Service 2: OpenCage (backup service)
      async () => {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&limit=1`
        )
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          return {
            city: result.components.city || result.components.town || result.components.village,
            state: result.components.state,
            pincode: result.components.postcode
          }
        }
        return null
      }
    ]

    let locationData: LocationData = {
      latitude,
      longitude,
      city: 'Unknown City',
      state: 'Unknown State',
      isCurrentLocation: true
    }

    // Try each geocoding service
    for (const service of geocodingServices) {
      try {
        console.log('🔍 Trying geocoding service...')
        const result = await service()
        
        if (result && result.city) {
          locationData.city = result.city
          locationData.state = result.state || locationData.state
          
          if (result.pincode) {
            locationData.pincode = result.pincode
            console.log('✅ Pincode found from geocoding:', result.pincode)
            break // Found pincode, no need to try other services
          }
        }
      } catch (error) {
        console.warn('⚠️ Geocoding service failed:', error)
        continue
      }
    }

    // If no pincode found from geocoding, try to get it from city name via backend
    if (!locationData.pincode && locationData.city && locationData.city !== 'Unknown City') {
      try {
        console.log('🔍 Trying to get pincode from city name via backend:', locationData.city)
        const pincode = await this.getPincodeFromCity(locationData.city)
        if (pincode) {
          locationData.pincode = pincode
          console.log('✅ Pincode found from backend city mapping:', pincode)
        } else {
          console.warn('⚠️ No pincode found for city:', locationData.city)
        }
      } catch (error) {
        console.warn('⚠️ Could not get pincode from city name:', error)
      }
    }

    console.log('🎯 Final location data:', locationData)

    return locationData
  }

  /**
   * Get pincode from city name
   */
  static async getPincodeFromCity(cityName: string): Promise<string | null> {
    try {
      const response = await this.api.get(`/utils/pincode/${encodeURIComponent(cityName)}`)
      
      if (response.data.success) {
        return response.data.data.pincode
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting pincode from city:', error)
      return null
    }
  }

  /**
   * Get theaters near a specific pincode
   */
  static async getTheatersNearPincode(pincode: string, maxDistance: number = 50): Promise<Theater[]> {
    try {
      console.log(`🎭 Fetching theaters near pincode: ${pincode}`)
      
      const response = await this.api.get(`/near/${pincode}`, {
        params: { maxDistance }
      })

      if (response.data.success) {
        console.log(`✅ Found ${response.data.total} theaters near ${pincode}`)
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error fetching nearby theaters:', error)
      return []
    }
  }

  /**
   * Get theaters in a specific city
   */
  static async getTheatersInCity(cityName: string): Promise<Theater[]> {
    try {
      console.log(`🏙️ Fetching theaters in city: ${cityName}`)
      
      const response = await this.api.get(`/city/${encodeURIComponent(cityName)}`)

      if (response.data.success) {
        console.log(`✅ Found ${response.data.total} theaters in ${cityName}`)
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error fetching theaters in city:', error)
      return []
    }
  }

  /**
   * Get events near a specific pincode
   */
  static async getEventsNearPincode(pincode: string): Promise<Event[]> {
    try {
      console.log(`🎪 Fetching events near pincode: ${pincode}`)
      
      const response = await this.api.get(`/events/near/${pincode}`)

      if (response.data.success) {
        console.log(`✅ Found ${response.data.total} events near ${pincode}`)
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error fetching nearby events:', error)
      return []
    }
  }

  /**
   * Get events for a specific theater
   */
  static async getEventsForTheater(theaterId: string): Promise<Event[]> {
    try {
      console.log(`🎭 Fetching events for theater: ${theaterId}`)
      
      const response = await this.api.get(`/${theaterId}/events`)

      if (response.data.success) {
        console.log(`✅ Found ${response.data.total} events for theater ${theaterId}`)
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error fetching theater events:', error)
      return []
    }
  }

  /**
   * Search theaters by query
   */
  static async searchTheaters(query: string): Promise<Theater[]> {
    try {
      console.log(`🔍 Searching theaters with query: "${query}"`)
      
      // If query is empty, get all theaters
      if (!query || query.trim() === '') {
        const response = await this.api.get('/')
        if (response.data.success) {
          console.log(`✅ Found ${response.data.total} total theaters`)
          return response.data.data
        }
        return []
      }
      
      const response = await this.api.get('/search', {
        params: { q: query }
      })

      if (response.data.success) {
        console.log(`✅ Found ${response.data.total} theaters matching "${query}"`)
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('❌ Error searching theaters:', error)
      return []
    }
  }

  /**
   * Get theaters based on user's location preference
   */
  static async getTheatersForUser(locationData: LocationData): Promise<Theater[]> {
    try {
      // If we have a pincode, use it directly
      if (locationData.pincode) {
        return await this.getTheatersNearPincode(locationData.pincode)
      }

      // If we have a city, try to get its pincode first
      if (locationData.city) {
        const pincode = await this.getPincodeFromCity(locationData.city)
        if (pincode) {
          return await this.getTheatersNearPincode(pincode)
        }
        
        // Fallback to city-based search
        return await this.getTheatersInCity(locationData.city)
      }

      // If no location data, return all theaters
      const response = await this.api.get('/')
      return response.data.success ? response.data.data : []

    } catch (error) {
      console.error('❌ Error getting theaters for user:', error)
      return []
    }
  }

  /**
   * Get events based on user's location preference
   */
  static async getEventsForUser(locationData: LocationData): Promise<Event[]> {
    try {
      // If we have a pincode, use it directly
      if (locationData.pincode) {
        return await this.getEventsNearPincode(locationData.pincode)
      }

      // If we have a city, try to get its pincode first
      if (locationData.city) {
        const pincode = await this.getPincodeFromCity(locationData.city)
        if (pincode) {
          return await this.getEventsNearPincode(pincode)
        }
      }

      // Fallback: get theaters in city and then their events
      const theaters = await this.getTheatersForUser(locationData)
      const allEvents: Event[] = []

      for (const theater of theaters.slice(0, 5)) { // Limit to first 5 theaters
        try {
          const events = await this.getEventsForTheater(theater.id)
          allEvents.push(...events)
        } catch (error) {
          console.error(`❌ Error fetching events for theater ${theater.id}:`, error)
          continue
        }
      }

      return allEvents

    } catch (error) {
      console.error('❌ Error getting events for user:', error)
      return []
    }
  }
}