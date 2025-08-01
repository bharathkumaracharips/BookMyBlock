import express from 'express'
import axios from 'axios'

const router = express.Router()

// In-memory storage for demo purposes
// In production, this would be replaced with database operations
let events: any[] = []
let eventIdCounter = 1
let isInitialized = false // Will be initialized by loading from IPFS

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

    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      params: {
        status: 'pinned',
        pageLimit: 100
      }
    })

    console.log(`📡 Found ${response.data.rows.length} total pins on IPFS`)

    // Clear existing sample events to load real ones from IPFS
    const realEventsFromIPFS = []

    // Load each pin and check if it's an event
    for (const pin of response.data.rows) {
      try {
        console.log(`🔍 Checking pin: ${pin.ipfs_pin_hash}`)

        const eventResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`, {
          timeout: 5000
        })
        const eventData = eventResponse.data

        console.log(`📄 Pin content preview:`, JSON.stringify(eventData).substring(0, 200))

        // Check if this is an event - be more flexible with the structure
        if (eventData &&
          (eventData.movieTitle || eventData.title) &&
          (eventData.theaterId || eventData.theater_id)) {

          const movieTitle = eventData.movieTitle || eventData.title
          const theaterId = eventData.theaterId || eventData.theater_id

          console.log(`✅ Found event: ${movieTitle} for theater: ${theaterId}`)

          // Convert IPFS event data to backend format
          const backendEvent = {
            id: `ipfs_event_${eventIdCounter++}`,
            theaterId: theaterId,
            movieTitle: movieTitle,
            startDate: eventData.startDate || eventData.start_date || new Date().toISOString().split('T')[0],
            endDate: eventData.endDate || eventData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            showTimes: eventData.showTimes || eventData.show_times || ['19:00'],
            ticketPrice: eventData.ticketPrice || eventData.ticket_price || 250,
            description: eventData.description || `${movieTitle} - Theater Event`,
            ipfsHash: pin.ipfs_pin_hash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`,
            posterHash: eventData.posterHash || eventData.poster_hash || null,
            posterUrl: eventData.posterUrl || eventData.poster_url || null,
            trailerUrl: eventData.trailerUrl || eventData.trailer_url || null,
            status: 'upcoming',
            availableSeats: eventData.availableSeats || 180,
            totalSeats: eventData.totalSeats || 200,
            createdAt: eventData.createdAt || eventData.created_at || new Date().toISOString(),
            updatedAt: eventData.updatedAt || eventData.updated_at || new Date().toISOString()
          }

          realEventsFromIPFS.push(backendEvent)
          console.log(`✅ Loaded real event from IPFS: ${movieTitle} (ID: ${backendEvent.id})`)
        } else {
          console.log(`⏭️ Skipping non-event pin: ${pin.ipfs_pin_hash}`)
        }
      } catch (eventError) {
        console.warn(`⚠️ Failed to load/parse pin ${pin.ipfs_pin_hash}:`, eventError)
      }
    }

    // Only use real events from IPFS - no sample events
    events = realEventsFromIPFS
    console.log(`🎬 Loaded ${realEventsFromIPFS.length} real events from IPFS (no sample events)`)

    console.log(`✅ Successfully loaded ${events.length} real events from IPFS`)
    isInitialized = true
  } catch (error) {
    console.error('❌ Error loading events from IPFS:', error)
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

    // Reset state completely - no sample events, only real IPFS events
    events = []
    eventIdCounter = 1
    isInitialized = false

    // Reload from IPFS
    await loadEventsFromIPFS()

    res.json({
      success: true,
      message: `Successfully loaded ${events.length} real events from IPFS`,
      data: {
        eventsLoaded: events.length,
        ipfsEvents: events.filter(e => e.id.startsWith('ipfs_')).length,
        timestamp: new Date().toISOString(),
        events: events.map(e => ({ id: e.id, title: e.movieTitle, theater: e.theaterId }))
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