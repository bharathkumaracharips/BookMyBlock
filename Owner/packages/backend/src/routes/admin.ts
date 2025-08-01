import express from 'express'
import { PinataService } from '../services/pinataService'

const router = express.Router()

// In-memory storage for demo (replace with database in production)
let theaterApplications: any[] = [
  // Sample approved theater for testing location-based discovery - Tirupati
  {
    id: 'theater_app_1',
    theaterName: 'PVR Cinemas Tirupati',
    address: 'Kummarimitta Street, Tirupati',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    pincode: '517501',
    numberOfScreens: 1,
    totalSeats: 200,
    parkingSpaces: 50,
    amenities: [],
    ownerName: 'Theater Owner',
    ownerEmail: 'owner@pvr.com',
    ownerPhone: '+91-9876543210',
    gstNumber: 'GST123456789',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdfHash: 'sample_pdf_hash_123',
    ipfsUrls: {
      pdf: 'https://gateway.pinata.cloud/ipfs/sample_pdf_hash_123'
    },
    adminAction: {
      action: 'approved',
      adminNotes: 'Application approved for testing',
      actionDate: new Date().toISOString(),
      adminId: 'admin-1'
    }
  },
  // Sample approved theater for Hyderabad testing
  {
    id: 'theater_app_2',
    theaterName: 'INOX GVK One Mall',
    address: 'GVK One Mall, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    numberOfScreens: 6,
    totalSeats: 1200,
    parkingSpaces: 200,
    amenities: ['Food Court', 'Parking', 'AC'],
    ownerName: 'INOX Management',
    ownerEmail: 'manager@inox.com',
    ownerPhone: '+91-9876543211',
    gstNumber: 'GST987654321',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdfHash: 'sample_pdf_hash_456',
    ipfsUrls: {
      pdf: 'https://gateway.pinata.cloud/ipfs/sample_pdf_hash_456'
    },
    adminAction: {
      action: 'approved',
      adminNotes: 'Premium theater approved',
      actionDate: new Date().toISOString(),
      adminId: 'admin-1'
    }
  },
  // Another Hyderabad theater
  {
    id: 'theater_app_3',
    theaterName: 'PVR Forum Sujana Mall',
    address: 'Forum Sujana Mall, Kukatpally',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    numberOfScreens: 4,
    totalSeats: 800,
    parkingSpaces: 150,
    amenities: ['Food Court', 'Gaming Zone'],
    ownerName: 'PVR Management',
    ownerEmail: 'manager@pvr.com',
    ownerPhone: '+91-9876543212',
    gstNumber: 'GST456789123',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdfHash: 'sample_pdf_hash_789',
    ipfsUrls: {
      pdf: 'https://gateway.pinata.cloud/ipfs/sample_pdf_hash_789'
    },
    adminAction: {
      action: 'approved',
      adminNotes: 'Mall theater approved',
      actionDate: new Date().toISOString(),
      adminId: 'admin-1'
    }
  },
  // Secunderabad theater (close to Hyderabad)
  {
    id: 'theater_app_4',
    theaterName: 'AMB Cinemas',
    address: 'AMB Mall, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    numberOfScreens: 5,
    totalSeats: 1000,
    parkingSpaces: 300,
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats'],
    ownerName: 'AMB Management',
    ownerEmail: 'manager@amb.com',
    ownerPhone: '+91-9876543213',
    gstNumber: 'GST789123456',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdfHash: 'sample_pdf_hash_101',
    ipfsUrls: {
      pdf: 'https://gateway.pinata.cloud/ipfs/sample_pdf_hash_101'
    },
    adminAction: {
      action: 'approved',
      adminNotes: 'Premium IMAX theater approved',
      actionDate: new Date().toISOString(),
      adminId: 'admin-1'
    }
  }
]
let applicationIdCounter = 5

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

export default router