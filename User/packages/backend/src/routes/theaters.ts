import express from 'express'
import { TheaterService } from '../services/theaterService'
import { PDFParsingService } from '../services/pdfParsingService'

const router = express.Router()

// Get all approved theaters
router.get('/', async (req, res) => {
  try {
    console.log('📋 User API: Fetching all theaters...')
    
    const theaters = await TheaterService.getAllApprovedTheaters()
    
    res.json({
      success: true,
      data: theaters,
      total: theaters.length
    })
  } catch (error) {
    console.error('❌ Error fetching theaters:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theaters',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get theaters near a specific pincode
router.get('/near/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params
    const maxDistance = parseInt(req.query.maxDistance as string) || 50
    
    console.log(`📍 User API: Finding theaters near pincode ${pincode}`)
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Please provide a 6-digit pincode.'
      })
    }
    
    const theaters = await TheaterService.getTheatersNearPincode(pincode, maxDistance)
    
    res.json({
      success: true,
      data: theaters,
      total: theaters.length,
      searchCriteria: {
        pincode,
        maxDistance
      }
    })
  } catch (error) {
    console.error('❌ Error fetching nearby theaters:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby theaters',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get theaters in a specific city
router.get('/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params
    
    console.log(`🏙️ User API: Finding theaters in city ${cityName}`)
    
    const theaters = await TheaterService.getTheatersInCity(cityName)
    
    res.json({
      success: true,
      data: theaters,
      total: theaters.length,
      searchCriteria: {
        city: cityName
      }
    })
  } catch (error) {
    console.error('❌ Error fetching theaters in city:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theaters in city',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get events near a specific pincode
router.get('/events/near/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params
    
    console.log(`🎪 User API: Finding events near pincode ${pincode}`)
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Please provide a 6-digit pincode.'
      })
    }
    
    const events = await TheaterService.getEventsNearPincode(pincode)
    
    res.json({
      success: true,
      data: events,
      total: events.length,
      searchCriteria: {
        pincode
      }
    })
  } catch (error) {
    console.error('❌ Error fetching nearby events:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby events',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Search theaters by query
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }
    
    console.log(`🔍 User API: Searching theaters with query "${query}"`)
    
    const theaters = await TheaterService.searchTheaters(query)
    
    res.json({
      success: true,
      data: theaters,
      total: theaters.length,
      searchCriteria: {
        query
      }
    })
  } catch (error) {
    console.error('❌ Error searching theaters:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search theaters',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get pincode from city name (utility endpoint)
router.get('/utils/pincode/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params
    
    console.log(`🗺️ User API: Getting pincode for city ${cityName}`)
    
    const pincode = PDFParsingService.getPincodeFromCity(cityName)
    
    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: `Pincode not found for city: ${cityName}`
      })
    }
    
    res.json({
      success: true,
      data: {
        city: cityName,
        pincode
      }
    })
  } catch (error) {
    console.error('❌ Error getting pincode for city:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get pincode for city',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get events for a specific theater
router.get('/:theaterId/events', async (req, res) => {
  try {
    const { theaterId } = req.params
    
    console.log(`🎭 User API: Fetching events for theater ${theaterId}`)
    
    const events = await TheaterService.getEventsForTheater(theaterId)
    
    res.json({
      success: true,
      data: events,
      total: events.length
    })
  } catch (error) {
    console.error('❌ Error fetching theater events:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theater events',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Debug endpoint to test location detection
router.get('/debug/location/:city', async (req, res) => {
  try {
    const { city } = req.params
    
    console.log(`🔍 Debug: Testing location detection for city: ${city}`)
    
    const pincode = PDFParsingService.getPincodeFromCity(city)
    const theaters = await TheaterService.getAllApprovedTheaters()
    const cityTheaters = await TheaterService.getTheatersInCity(city)
    
    let nearbyTheaters = []
    if (pincode) {
      nearbyTheaters = await TheaterService.getTheatersNearPincode(pincode)
    }
    
    res.json({
      success: true,
      debug: {
        inputCity: city,
        detectedPincode: pincode,
        totalTheaters: theaters.length,
        cityTheaters: cityTheaters.length,
        nearbyTheaters: nearbyTheaters.length,
        allTheaterPincodes: theaters.map(t => ({ name: t.name, pincode: t.pincode, city: t.city }))
      },
      data: {
        cityTheaters,
        nearbyTheaters
      }
    })
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router