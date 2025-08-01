import express from 'express'
import axios from 'axios'

const router = express.Router()

// In-memory storage for demo purposes
// In production, this would be replaced with database operations
let events: any[] = []
let eventIdCounter = 1
let isInitialized = false

// Pinata configuration for loading events from IPFS
const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMTAzNGUyNC0yZjdjLTRkNzItYmZmZi0yZTY0MTJmNjhkODMiLCJlbWFpbCI6ImJoYXJhdGhrdW1hcmFjaGFyaXBzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MDE0MjBlZjg4ZDE0NGJiZDQxYyIsInNjb3BlZEtleVNlY3JldCI6IjE3Nzg3YzcxN2UzM2M2NTU1ZTIzNmU4YjVhNWYyYzZmOTNlZmZiOGVkNjg1OGY5MDUxYTRiZjhjMjIxNDJmZTMiLCJleHAiOjE3ODU1MjE3MTd9.ZM-VPs8f_FxJ7jzlt4tzoB3mduFkIz4EeHXFpkuheso'

// Load events from IPFS on server startup
async function loadEventsFromIPFS() {
  if (isInitialized) {
    console.log('⏭️ Already initialized, skipping IPFS load')
    return
  }
  
  try {
    console.log('🔄 Starting IPFS event loading process...')
    console.log('🔑 Using Pinata JWT (first 50 chars):', PINATA_JWT.substring(0, 50) + '...')
    console.log('🔑 JWT from env:', process.env.PINATA_JWT ? 'Found in env' : 'Not found in env')
    console.log('🔑 JWT length:', PINATA_JWT.length)
    
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      params: {
        status: 'pinned',
        pageLimit: 100
        // Remove metadata filtering for now to get all pins
      }
    })

    console.log(`📡 Found ${response.data.rows.length} total pins on IPFS`)

    // Load each pin and check if it's an event
    for (const pin of response.data.rows) {
      try {
        console.log(`🔍 Checking pin: ${pin.ipfs_pin_hash}`)
        
        const eventResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`)
        const eventData = eventResponse.data

        // Check if this is an event (has the required event structure)
        if (eventData && 
            eventData.metadata && 
            eventData.metadata.type === 'theater_event' &&
            eventData.movieTitle && 
            eventData.theaterId) {
          
          console.log(`✅ Found event: ${eventData.movieTitle}`)

          // Convert IPFS event data to backend format
          const backendEvent = {
            id: `event_${eventIdCounter++}`,
            theaterId: eventData.theaterId,
            movieTitle: eventData.movieTitle,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            showTimes: eventData.showTimes || [],
            ticketPrice: eventData.ticketPrice,
            description: eventData.description || '',
            ipfsHash: pin.ipfs_pin_hash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`,
            posterHash: eventData.posterHash || null,
            posterUrl: eventData.posterUrl || null,
            trailerUrl: eventData.trailerUrl || null,
            status: 'upcoming',
            availableSeats: 100,
            totalSeats: 100,
            createdAt: eventData.createdAt || new Date().toISOString(),
            updatedAt: eventData.createdAt || new Date().toISOString()
          }

          events.push(backendEvent)
          console.log(`✅ Loaded event: ${eventData.movieTitle} (ID: ${backendEvent.id})`)
        } else {
          console.log(`⏭️ Skipping non-event pin: ${pin.ipfs_pin_hash}`)
        }
      } catch (eventError) {
        console.warn(`⚠️ Failed to load/parse pin ${pin.ipfs_pin_hash}:`, eventError.message)
      }
    }

    console.log(`✅ Successfully loaded ${events.length} events from IPFS`)
    isInitialized = true
  } catch (error) {
    console.error('❌ Error loading events from IPFS:', error.message)
    isInitialized = true // Mark as initialized even if failed to prevent retry loops
  }
}

// Initialize events on first request
async function ensureInitialized() {
  if (!isInitialized) {
    console.log('🚀 First API request - initializing events from IPFS...')
    await loadEventsFromIPFS()
    console.log(`📊 Initialization complete. ${events.length} events loaded.`)
  }
}

// Create a new event
router.post('/', async (req, res) => {
  try {
    await ensureInitialized()
    const { theaterId, movieTitle, startDate, endDate, showTimes, ticketPrice, description, ipfsHash, ipfsUrl, posterHash, posterUrl, trailerUrl } = req.body

    // Validate required fields
    if (!theaterId || !movieTitle || !startDate || !endDate || !showTimes || !ticketPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: theaterId, movieTitle, startDate, endDate, showTimes, ticketPrice'
      })
    }

    // Validate show times array
    if (!Array.isArray(showTimes) || showTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one show time is required'
      })
    }

    // Validate ticket price
    if (ticketPrice < 50 || ticketPrice > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Ticket price must be between ₹50 and ₹1000'
      })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start < new Date(now.setHours(0, 0, 0, 0))) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be today or in the future'
      })
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      })
    }

    // Create new event
    const newEvent = {
      id: `event_${eventIdCounter++}`,
      theaterId,
      movieTitle,
      startDate,
      endDate,
      showTimes,
      ticketPrice: parseInt(ticketPrice),
      description: description || '',
      ipfsHash: ipfsHash || null,
      ipfsUrl: ipfsUrl || null,
      posterHash: posterHash || null,
      posterUrl: posterUrl || null,
      trailerUrl: trailerUrl || null,
      status: 'upcoming',
      availableSeats: 100, // Default - would come from theater data
      totalSeats: 100,     // Default - would come from theater data
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    events.push(newEvent)

    console.log('✅ Event created:', newEvent.id)
    console.log('📄 IPFS Hash:', ipfsHash || 'Not stored on IPFS')

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    })

  } catch (error) {
    console.error('❌ Error creating event:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get events for a specific theater
router.get('/theater/:theaterId', async (req, res) => {
  try {
    await ensureInitialized()
    const { theaterId } = req.params

    if (!theaterId) {
      return res.status(400).json({
        success: false,
        message: 'Theater ID is required'
      })
    }

    const theaterEvents = events.filter(event => event.theaterId === theaterId)

    console.log(`📡 Found ${theaterEvents.length} events for theater ${theaterId}`)

    res.json({
      success: true,
      data: theaterEvents
    })

  } catch (error) {
    console.error('❌ Error fetching theater events:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get all events for a user (across all their theaters)
router.get('/user', async (req, res) => {
  try {
    console.log('📡 GET /user route called')
    await ensureInitialized()
    console.log(`📊 After initialization: ${events.length} events in memory`)
    const { userId } = req.query

    // For demo purposes, return all events
    // In production, you'd filter by user's theaters
    const userEvents = events

    console.log(`📡 Found ${userEvents.length} events for user ${userId}`)

    res.json({
      success: true,
      data: userEvents
    })

  } catch (error) {
    console.error('❌ Error fetching user events:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update an event
router.put('/:eventId', async (req, res) => {
  try {
    await ensureInitialized()
    const { eventId } = req.params
    const updateData = req.body

    const eventIndex = events.findIndex(event => event.id === eventId)

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    // Update the event
    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    console.log('✅ Event updated:', eventId)

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: events[eventIndex]
    })

  } catch (error) {
    console.error('❌ Error updating event:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Delete an event
router.delete('/:eventId', async (req, res) => {
  try {
    await ensureInitialized()
    const { eventId } = req.params

    const eventIndex = events.findIndex(event => event.id === eventId)

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    events.splice(eventIndex, 1)

    console.log('✅ Event deleted:', eventId)

    res.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting event:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get event statistics
router.get('/stats', async (req, res) => {
  try {
    await ensureInitialized()
    const { userId } = req.query

    // Calculate stats from in-memory events
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const stats = {
      totalEvents: events.length,
      upcomingEvents: events.filter(event => {
        const eventStartDate = new Date(event.startDate)
        return eventStartDate >= now && event.status === 'upcoming'
      }).length,
      ongoingEvents: events.filter(event => {
        if (event.startDate && event.endDate) {
          const startDate = event.startDate
          const endDate = event.endDate
          return startDate <= today && endDate >= today && event.status === 'upcoming'
        }
        return event.status === 'ongoing'
      }).length,
      completedEvents: events.filter(event => {
        if (event.endDate) {
          return new Date(event.endDate) < now || event.status === 'completed'
        }
        return event.status === 'completed'
      }).length,
      totalRevenue: events.reduce((total, event) => {
        const soldSeats = event.totalSeats - event.availableSeats
        return total + (soldSeats * event.ticketPrice)
      }, 0),
      totalTicketsSold: events.reduce((total, event) => {
        return total + (event.totalSeats - event.availableSeats)
      }, 0)
    }

    console.log('📊 Event stats calculated:', stats)

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('❌ Error calculating event stats:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get event by ID
router.get('/:eventId', async (req, res) => {
  try {
    await ensureInitialized()
    const { eventId } = req.params

    const event = events.find(event => event.id === eventId)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    console.log('✅ Event found:', eventId)

    res.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('❌ Error fetching event:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Cancel an event
router.patch('/:eventId/cancel', async (req, res) => {
  try {
    await ensureInitialized()
    const { eventId } = req.params
    const { reason } = req.body

    const eventIndex = events.findIndex(event => event.id === eventId)

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    // Update event status to cancelled
    events[eventIndex] = {
      ...events[eventIndex],
      status: 'cancelled',
      cancellationReason: reason || 'No reason provided',
      updatedAt: new Date().toISOString()
    }

    console.log('✅ Event cancelled:', eventId)

    res.json({
      success: true,
      message: 'Event cancelled successfully',
      data: events[eventIndex]
    })

  } catch (error) {
    console.error('❌ Error cancelling event:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Test endpoint to verify backend is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Events backend is working',
    eventsInMemory: events.length,
    isInitialized,
    timestamp: new Date().toISOString()
  })
})

// Debug endpoint to check IPFS pins
router.get('/debug-ipfs', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking IPFS pins...')
    
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      params: {
        status: 'pinned',
        pageLimit: 10
      }
    })

    const debugInfo = []
    
    for (const pin of response.data.rows.slice(0, 5)) { // Check first 5 pins
      try {
        const contentResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`)
        debugInfo.push({
          hash: pin.ipfs_pin_hash,
          metadata: pin.metadata,
          content: contentResponse.data,
          isEvent: contentResponse.data?.metadata?.type === 'theater_event'
        })
      } catch (error) {
        debugInfo.push({
          hash: pin.ipfs_pin_hash,
          metadata: pin.metadata,
          error: error.message
        })
      }
    }

    res.json({
      success: true,
      totalPins: response.data.rows.length,
      currentEvents: events.length,
      debugInfo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Manual refresh endpoint to reload events from IPFS
router.post('/refresh-from-ipfs', async (req, res) => {
  try {
    console.log('🔄 Manual refresh requested - reloading events from IPFS...')
    
    // Reset state
    events = []
    eventIdCounter = 1
    isInitialized = false
    
    // Reload from IPFS
    await loadEventsFromIPFS()
    
    res.json({
      success: true,
      message: `Successfully reloaded ${events.length} events from IPFS`,
      data: {
        eventsLoaded: events.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Error refreshing events from IPFS:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to refresh events from IPFS'
    })
  }
})

export default router