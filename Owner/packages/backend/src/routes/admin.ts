import express from 'express'
// import { PinataService } from '../services/pinataService'

const router = express.Router()

// In-memory storage for demo (replace with database in production)
// Only real theater applications from actual registrations will be stored here
let theaterApplications: any[] = []
let applicationIdCounter = 1

// Get theater applications with optional status filter
router.get('/theater-requests', async (req, res) => {
  try {
    const { status } = req.query
    console.log('📋 Admin fetching theater requests with status filter:', status)

    let filteredApplications = theaterApplications

    // Filter by status if provided
    if (status && typeof status === 'string') {
      filteredApplications = theaterApplications.filter(app => app.status === status)
    } else {
      // Default to pending applications for backward compatibility
      filteredApplications = theaterApplications.filter(app => app.status === 'pending')
    }

    console.log(`✅ Found ${filteredApplications.length} applications with status: ${status || 'pending'}`)

    res.json({
      success: true,
      data: filteredApplications,
      total: filteredApplications.length
    })
  } catch (error) {
    console.error('❌ Error fetching theater requests:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theater requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get all approved theaters (for User app)
router.get('/approved-theaters', async (req, res) => {
  try {
    console.log('🎭 Fetching approved theaters for User app...')

    const approvedTheaters = theaterApplications.filter(app => app.status === 'approved')

    console.log(`✅ Found ${approvedTheaters.length} approved theaters`)

    res.json({
      success: true,
      data: approvedTheaters,
      total: approvedTheaters.length
    })
  } catch (error) {
    console.error('❌ Error fetching approved theaters:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved theaters',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get specific theater application by ID
router.get('/theater-requests/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('📋 Admin fetching theater request:', id)

    const application = theaterApplications.find(app => app.id === id)

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Theater application not found'
      })
    }

    console.log('✅ Theater application found')

    res.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('❌ Error fetching theater request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theater request',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Accept theater application
router.post('/theater-requests/:id/accept', async (req, res) => {
  try {
    const { id } = req.params
    const { adminNotes } = req.body

    console.log('✅ Admin accepting theater request:', id)

    const applicationIndex = theaterApplications.findIndex(app => app.id === id)

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Theater application not found'
      })
    }

    // Update application status
    theaterApplications[applicationIndex] = {
      ...theaterApplications[applicationIndex],
      status: 'approved',
      adminAction: {
        action: 'approved',
        adminNotes: adminNotes || 'Application approved',
        actionDate: new Date().toISOString(),
        adminId: 'admin-1' // Replace with actual admin ID from auth
      },
      updatedAt: new Date().toISOString()
    }

    console.log('✅ Theater application approved successfully')

    res.json({
      success: true,
      message: 'Theater application approved successfully',
      data: theaterApplications[applicationIndex]
    })
  } catch (error) {
    console.error('❌ Error approving theater request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve theater request',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Reject theater application
router.post('/theater-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { rejectionReason, adminNotes } = req.body

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      })
    }

    console.log('❌ Admin rejecting theater request:', id)

    const applicationIndex = theaterApplications.findIndex(app => app.id === id)

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Theater application not found'
      })
    }

    // Update application status
    theaterApplications[applicationIndex] = {
      ...theaterApplications[applicationIndex],
      status: 'rejected',
      adminAction: {
        action: 'rejected',
        rejectionReason,
        adminNotes: adminNotes || '',
        actionDate: new Date().toISOString(),
        adminId: 'admin-1' // Replace with actual admin ID from auth
      },
      updatedAt: new Date().toISOString()
    }

    console.log('❌ Theater application rejected successfully')

    res.json({
      success: true,
      message: 'Theater application rejected successfully',
      data: theaterApplications[applicationIndex]
    })
  } catch (error) {
    console.error('❌ Error rejecting theater request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reject theater request',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Submit new theater application (called by owner)
router.post('/theater-requests', async (req, res) => {
  try {
    const applicationData = req.body
    console.log('📝 New theater application submitted')

    // Create new application record
    const newApplication = {
      id: `theater_app_${applicationIdCounter++}`,
      ...applicationData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store application
    theaterApplications.push(newApplication)

    console.log('✅ Theater application stored successfully:', newApplication.id)

    res.json({
      success: true,
      message: 'Theater application submitted successfully',
      data: newApplication
    })
  } catch (error) {
    console.error('❌ Error submitting theater application:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit theater application',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get admin dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Admin fetching dashboard stats...')

    const stats = {
      totalApplications: theaterApplications.length,
      pendingApplications: theaterApplications.filter(app => app.status === 'pending').length,
      approvedApplications: theaterApplications.filter(app => app.status === 'approved').length,
      rejectedApplications: theaterApplications.filter(app => app.status === 'rejected').length,
      recentApplications: theaterApplications
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5)
    }

    console.log('✅ Dashboard stats calculated')

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// In-memory storage for seat layouts (replace with database in production)
let seatLayouts: any[] = []

// Get all theaters for an owner (for seat layout management)
router.get('/theaters/owner/:ownerEmail', async (req, res) => {
  try {
    const { ownerEmail } = req.params
    
    console.log('📋 Getting theaters for owner:', ownerEmail)
    console.log('📋 Total theater applications:', theaterApplications.length)
    console.log('📋 All theater applications:', theaterApplications.map(app => ({
      id: app.id,
      theaterName: app.theaterName,
      ownerEmail: app.ownerEmail,
      status: app.status
    })))
    
    // Filter approved theaters by owner email
    const ownerTheaters = theaterApplications.filter(app => {
      const isApproved = app.status === 'approved'
      const emailMatch = app.ownerEmail === ownerEmail
      
      console.log(`🔍 Theater ${app.theaterName}: approved=${isApproved}, emailMatch=${emailMatch} (${app.ownerEmail} vs ${ownerEmail})`)
      
      return isApproved && emailMatch
    }).map(theater => ({
      id: theater.id,
      name: theater.theaterName,
      screens: theater.screens || 1,
      totalSeats: theater.totalSeats || 100,
      location: theater.location || `${theater.city}, ${theater.state}`,
      ownerEmail: theater.ownerEmail
    }))
    
    console.log(`✅ Found ${ownerTheaters.length} approved theaters for owner ${ownerEmail}`)
    
    if (ownerTheaters.length > 0) {
      res.json({
        success: true,
        data: ownerTheaters,
        total: ownerTheaters.length
      })
    } else {
      // Return empty array instead of test data if no real theaters found
      console.log('⚠️ No approved theaters found for this owner')
      res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No approved theaters found for this owner'
      })
    }
  } catch (error) {
    console.error('❌ Error getting theaters for owner:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get theaters for owner',
      error: error.message
    })
  }
})

// Save seat layout configuration
router.post('/seat-layouts', async (req, res) => {
  try {
    const seatLayoutData = req.body
    
    console.log('💾 Saving seat layout for theater:', seatLayoutData.theaterId)
    
    // Check if layout already exists
    const existingIndex = seatLayouts.findIndex(layout => layout.theaterId === seatLayoutData.theaterId)
    
    if (existingIndex !== -1) {
      // Update existing layout
      seatLayouts[existingIndex] = {
        ...seatLayoutData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Create new layout
      seatLayouts.push({
        ...seatLayoutData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    console.log('✅ Seat layout saved successfully')
    
    res.json({
      success: true,
      message: 'Seat layout saved successfully',
      data: {
        theaterId: seatLayoutData.theaterId,
        ipfsHash: seatLayoutData.ipfsHash,
        lastUpdated: seatLayoutData.lastUpdated
      }
    })
  } catch (error) {
    console.error('❌ Error saving seat layout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to save seat layout'
    })
  }
})

// Get seat layout for a theater
router.get('/seat-layouts/:theaterId', async (req, res) => {
  try {
    const { theaterId } = req.params
    
    console.log('📋 Getting seat layout for theater:', theaterId)
    
    // Find existing layout
    const existingLayout = seatLayouts.find(layout => layout.theaterId === theaterId)
    
    if (existingLayout) {
      console.log('✅ Found existing seat layout')
      res.json({
        success: true,
        data: existingLayout
      })
    } else {
      console.log('📝 No existing seat layout found')
      res.json({
        success: true,
        data: null // This will trigger creation of default layout
      })
    }
  } catch (error) {
    console.error('❌ Error getting seat layout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get seat layout'
    })
  }
})

export default router