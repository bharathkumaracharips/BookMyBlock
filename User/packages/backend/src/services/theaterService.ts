import axios from 'axios'
import { PDFParsingService, TheaterLocationData } from './pdfParsingService'

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
  distance?: number // Distance from user location in km (approximate)
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
  status: 'active' | 'cancelled' | 'completed'
}

export class TheaterService {
  private static OWNER_API_BASE = process.env.OWNER_API_BASE_URL || 'http://localhost:8002/api'

  /**
   * Get all approved theaters from Owner backend
   */
  static async getAllApprovedTheaters(): Promise<Theater[]> {
    try {
      console.log('🎭 Fetching approved theaters from Owner backend...')
      
      const response = await axios.get(`${this.OWNER_API_BASE}/admin/approved-theaters`, {
        timeout: 10000
      })

      if (!response.data.success) {
        throw new Error('Failed to fetch theaters from Owner backend')
      }

      // All theaters from this endpoint are already approved
      const approvedApplications = response.data.data
      const theaters: Theater[] = []

      // Also check for blockchain theaters that might have events
      console.log('🔍 Checking for blockchain theaters with events...')
      try {
        const eventsResponse = await axios.get(`${this.OWNER_API_BASE}/events/user`, {
          timeout: 5000
        })
        
        if (eventsResponse.data.success) {
          const allEvents = eventsResponse.data.data
          console.log(`📡 Found ${allEvents.length} total events`)
          
          // Find unique blockchain theater IDs that have events
          const blockchainTheaterIds = [...new Set(
            allEvents
              .filter((event: any) => event.theaterId.startsWith('blockchain_'))
              .map((event: any) => event.theaterId)
          )]
          
          console.log(`🔗 Found ${blockchainTheaterIds.length} blockchain theaters with events:`, blockchainTheaterIds)
          
          // Map blockchain theaters to our sample theaters for demo purposes
          for (const blockchainId of blockchainTheaterIds) {
            // Map to Tirupati theater for demo
            const mappedTheater: Theater = {
              id: blockchainId,
              name: 'PVR Cinemas Tirupati (Blockchain)',
              location: 'Tirupati, Andhra Pradesh',
              pincode: '517501',
              city: 'Tirupati',
              state: 'Andhra Pradesh',
              address: 'Kummarimitta Street, Tirupati',
              screens: 1,
              totalSeats: 200,
              status: 'active',
              ownerName: 'Theater Owner',
              ownerEmail: 'owner@pvr.com',
              ownerPhone: '+91-9876543210',
              pdfHash: 'blockchain_theater',
              ipfsUrls: {
                pdf: `https://gateway.pinata.cloud/ipfs/${blockchainId}`
              }
            }
            
            theaters.push(mappedTheater)
            console.log(`✅ Mapped blockchain theater ${blockchainId} to Tirupati`)
          }
        }
      } catch (eventsError) {
        console.warn('⚠️ Could not fetch events for blockchain theater mapping:', eventsError)
      }

      for (const app of approvedApplications) {
        try {
          let theaterData: TheaterLocationData | null = null

          // TODO: Re-enable PDF extraction once library issues are resolved
          // For now, skip PDF parsing and use application data directly
          if (app.pdfHash) {
            console.log(`📄 PDF available but parsing temporarily disabled: ${app.pdfHash}`)
          }

          // Fallback to application data if PDF parsing fails
          if (!theaterData) {
            console.log(`🔄 Using fallback data for theater ${app.id}`)
            theaterData = {
              theaterName: app.theaterName || 'Unknown Theater',
              pincode: app.pincode || '000000',
              city: app.city || 'Unknown City',
              state: app.state || 'Unknown State',
              address: app.address || 'Unknown Address',
              totalSeats: app.totalSeats || 100,
              numberOfScreens: app.numberOfScreens || 1,
              ownerName: app.ownerName || 'Unknown Owner',
              ownerEmail: app.ownerEmail || '',
              ownerPhone: app.ownerPhone || ''
            }
          }

          // Ensure we have a valid pincode
          if (!theaterData.pincode || theaterData.pincode === '000000') {
            // Try to get pincode from city name
            const cityPincode = PDFParsingService.getPincodeFromCity(theaterData.city)
            if (cityPincode) {
              theaterData.pincode = cityPincode
              console.log(`✅ Found pincode ${cityPincode} for city ${theaterData.city}`)
            }
          }

          const theater: Theater = {
            id: app.id,
            name: theaterData.theaterName,
            location: `${theaterData.city}, ${theaterData.state}`,
            pincode: theaterData.pincode,
            city: theaterData.city,
            state: theaterData.state,
            address: theaterData.address,
            screens: theaterData.numberOfScreens,
            totalSeats: theaterData.totalSeats,
            status: 'active',
            ownerName: theaterData.ownerName,
            ownerEmail: theaterData.ownerEmail,
            ownerPhone: theaterData.ownerPhone,
            pdfHash: app.pdfHash,
            ipfsUrls: app.ipfsUrls
          }

          theaters.push(theater)
          console.log(`✅ Processed theater: ${theater.name} (${theater.pincode})`)

        } catch (error) {
          console.error(`❌ Error processing theater application ${app.id}:`, error)
          continue
        }
      }

      console.log(`✅ Successfully processed ${theaters.length} approved theaters`)
      return theaters

    } catch (error) {
      console.error('❌ Error fetching theaters:', error)
      return []
    }
  }

  /**
   * Get theaters near a specific pincode
   */
  static async getTheatersNearPincode(userPincode: string, maxDistance: number = 50): Promise<Theater[]> {
    try {
      console.log(`🎯 Finding theaters near pincode: ${userPincode}`)
      
      const allTheaters = await this.getAllApprovedTheaters()
      
      const nearbyTheaters = allTheaters.filter(theater => {
        const isNearby = PDFParsingService.isPincodeNearby(userPincode, theater.pincode, maxDistance)
        if (isNearby) {
          // Calculate approximate distance (simplified)
          const distance = this.calculateApproximateDistance(userPincode, theater.pincode)
          theater.distance = distance
        }
        return isNearby
      })

      // Sort by distance (closest first)
      nearbyTheaters.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      console.log(`✅ Found ${nearbyTheaters.length} theaters near ${userPincode}`)
      return nearbyTheaters

    } catch (error) {
      console.error('❌ Error finding nearby theaters:', error)
      return []
    }
  }

  /**
   * Get theaters in a specific city
   */
  static async getTheatersInCity(cityName: string): Promise<Theater[]> {
    try {
      console.log(`🏙️ Finding theaters in city: ${cityName}`)
      
      const allTheaters = await this.getAllApprovedTheaters()
      
      const cityTheaters = allTheaters.filter(theater => 
        theater.city.toLowerCase().includes(cityName.toLowerCase()) ||
        theater.location.toLowerCase().includes(cityName.toLowerCase())
      )

      console.log(`✅ Found ${cityTheaters.length} theaters in ${cityName}`)
      return cityTheaters

    } catch (error) {
      console.error('❌ Error finding theaters in city:', error)
      return []
    }
  }

  /**
   * Get events from theaters near a pincode
   */
  static async getEventsNearPincode(userPincode: string): Promise<Event[]> {
    try {
      console.log(`🎪 Finding events near pincode: ${userPincode}`)
      
      const nearbyTheaters = await this.getTheatersNearPincode(userPincode)
      const events: Event[] = []

      // For each nearby theater, fetch its events
      for (const theater of nearbyTheaters) {
        try {
          const theaterEvents = await this.getEventsForTheater(theater.id)
          
          // Add theater info to events
          const enrichedEvents = theaterEvents.map(event => ({
            ...event,
            theaterId: theater.id,
            theaterName: theater.name,
            theaterLocation: theater.location
          }))

          events.push(...enrichedEvents)

        } catch (error) {
          console.error(`❌ Error fetching events for theater ${theater.id}:`, error)
          continue
        }
      }

      console.log(`✅ Found ${events.length} events near ${userPincode}`)
      return events

    } catch (error) {
      console.error('❌ Error finding nearby events:', error)
      return []
    }
  }

  /**
   * Get events for a specific theater from Owner's event management system
   */
  static async getEventsForTheater(theaterId: string): Promise<Event[]> {
    try {
      console.log(`🎪 Fetching real events for theater ${theaterId} from Owner backend...`)
      
      // Fetch events from Owner's events API
      const response = await axios.get(`${this.OWNER_API_BASE}/events/theater/${theaterId}`, {
        timeout: 10000
      })

      if (!response.data.success) {
        console.warn(`⚠️ No events found for theater ${theaterId}`)
        return []
      }

      const ownerEvents = response.data.data
      const events: Event[] = []

      // Convert Owner's event format to User's event format
      for (const ownerEvent of ownerEvents) {
        try {
          // Parse show times to get individual events
          const showTimes = ownerEvent.showTimes || []
          
          for (let i = 0; i < showTimes.length; i++) {
            const showTime = showTimes[i]
            
            const event: Event = {
              id: `${ownerEvent.id}_show_${i}`,
              title: ownerEvent.movieTitle || 'Event',
              description: ownerEvent.description || 'Theater event',
              theaterId: ownerEvent.theaterId,
              theaterName: '', // Will be filled by caller
              theaterLocation: '', // Will be filled by caller
              date: ownerEvent.startDate,
              time: showTime,
              duration: 120, // Default duration
              ticketPrice: ownerEvent.ticketPrice,
              availableSeats: ownerEvent.availableSeats || 100,
              totalSeats: ownerEvent.totalSeats || 100,
              category: 'Movie', // Default category
              imageUrl: ownerEvent.posterUrl || undefined,
              trailerUrl: ownerEvent.trailerUrl || undefined,
              status: ownerEvent.status === 'upcoming' ? 'active' : 
                     ownerEvent.status === 'cancelled' ? 'cancelled' : 'active'
            }
            
            events.push(event)
          }
          
          // If no show times, create a single event
          if (showTimes.length === 0) {
            const event: Event = {
              id: ownerEvent.id,
              title: ownerEvent.movieTitle || 'Event',
              description: ownerEvent.description || 'Theater event',
              theaterId: ownerEvent.theaterId,
              theaterName: '',
              theaterLocation: '',
              date: ownerEvent.startDate,
              time: '19:00', // Default time
              duration: 120,
              ticketPrice: ownerEvent.ticketPrice,
              availableSeats: ownerEvent.availableSeats || 100,
              totalSeats: ownerEvent.totalSeats || 100,
              category: 'Movie',
              imageUrl: ownerEvent.posterUrl || undefined,
              trailerUrl: ownerEvent.trailerUrl || undefined,
              status: ownerEvent.status === 'upcoming' ? 'active' : 
                     ownerEvent.status === 'cancelled' ? 'cancelled' : 'active'
            }
            
            events.push(event)
          }
          
        } catch (eventError) {
          console.error(`❌ Error processing event ${ownerEvent.id}:`, eventError)
          continue
        }
      }

      console.log(`✅ Converted ${ownerEvents.length} owner events to ${events.length} user events`)
      return events

    } catch (error) {
      console.error('❌ Error fetching theater events from Owner backend:', error)
      
      // No fallback - return empty array if Owner backend is not available
      console.log('🚫 No fallback events - returning empty array')
      return []
    }
  }



  /**
   * Calculate approximate distance between two pincodes
   * This is a simplified calculation - in production, use proper geolocation APIs
   */
  private static calculateApproximateDistance(pincode1: string, pincode2: string): number {
    try {
      const code1 = parseInt(pincode1)
      const code2 = parseInt(pincode2)
      const difference = Math.abs(code1 - code2)
      
      // Very rough approximation: 1000 pincode difference ≈ 50km
      return Math.round((difference / 1000) * 50)
      
    } catch (error) {
      return 0
    }
  }

  /**
   * Search theaters by name or location
   */
  static async searchTheaters(query: string): Promise<Theater[]> {
    try {
      console.log(`🔍 Searching theaters with query: ${query}`)
      
      const allTheaters = await this.getAllApprovedTheaters()
      
      const searchResults = allTheaters.filter(theater => 
        theater.name.toLowerCase().includes(query.toLowerCase()) ||
        theater.city.toLowerCase().includes(query.toLowerCase()) ||
        theater.state.toLowerCase().includes(query.toLowerCase()) ||
        theater.address.toLowerCase().includes(query.toLowerCase()) ||
        theater.pincode.includes(query)
      )

      console.log(`✅ Found ${searchResults.length} theaters matching "${query}"`)
      return searchResults

    } catch (error) {
      console.error('❌ Error searching theaters:', error)
      return []
    }
  }
}