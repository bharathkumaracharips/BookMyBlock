import express from 'express'
import axios from 'axios'
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

// Get seat layout for a theater from IPFS
router.get('/:theaterId/seat-layout', async (req, res) => {
  try {
    const { theaterId } = req.params
    
    console.log('🎭 User API: Getting seat layout for theater:', theaterId)
    
    const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMTAzNGUyNC0yZjdjLTRkNzItYmZmZi0yZTY0MTJmNjhkODMiLCJlbWFpbCI6ImJoYXJhdGhrdW1hcmFjaGFyaXBzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MDE0MjBlZjg4ZDE0NGJiZDQxYyIsInNjb3BlZEtleVNlY3JldCI6IjE3Nzg3YzcxN2UzM2M2NTU1ZTIzNmU4YjVhNWYyYzZmOTNlZmZiOGVkNjg1OGY5MDUxYTRiZjhjMjIxNDJmZTMiLCJleHAiOjE3ODU1MjE3MTd9.ZM-VPs8f_FxJ7jzlt4tzoB3mduFkIz4EeHXFpkuheso'
    
    // Get all pins from Pinata
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      params: {
        status: 'pinned',
        pageLimit: 100
      }
    })

    console.log(`🔍 Found ${response.data.rows.length} pins in Pinata`)
    
    // Find seat layout for this theater
    const seatLayoutPin = response.data.rows.find((pin: any) => {
      // Check both keyvalues format and direct metadata format
      const hasKeyvalues = pin.metadata?.keyvalues?.type === 'seat-layout' &&
                         pin.metadata?.keyvalues?.theaterId === theaterId
      
      const hasDirectMetadata = pin.metadata?.name?.includes('Seat Layout') &&
                              pin.metadata?.theaterId === theaterId
      
      return hasKeyvalues || hasDirectMetadata
    })

    if (seatLayoutPin) {
      console.log(`📍 Found seat layout pin on IPFS: ${seatLayoutPin.ipfs_pin_hash}`)
      
      // Fetch the actual seat layout data
      const layoutResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${seatLayoutPin.ipfs_pin_hash}`, {
        timeout: 10000
      })

      const layoutData = layoutResponse.data
      if (layoutData) {
        console.log('✅ Successfully fetched seat layout from IPFS')
        console.log(`📊 Layout has ${layoutData.screens?.length || 0} screens with ${layoutData.screens?.[0]?.totalSeats || 0} seats`)
        
        res.json({
          success: true,
          data: layoutData
        })
        return
      }
    }
    
    console.log('⚠️ No seat layout found on IPFS for theater:', theaterId)
    res.json({
      success: true,
      data: null
    })
  } catch (error) {
    console.error('❌ Error getting seat layout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get seat layout',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router