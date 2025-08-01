import express from 'express'

const router = express.Router()

// In-memory storage for demo purposes
// In production, this would be replaced with database operations
let events: any[] = []
let eventIdCounter = 1

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { theaterId, movieTitle, startDate, endDate, showTimes, ticketPrice, description, ipfsHash, ipfsUrl, posterHash, posterUrl } = req.body

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

export default router