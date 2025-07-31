import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_OWNER_API_BASE_URL || 'http://localhost:8002/api'

export interface TheaterApplication {
  id: string
  theaterName: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  address: string
  city: string
  state: string
  pincode: string
  numberOfScreens: number
  totalSeats: number
  parkingSpaces: number
  amenities?: string[]
  gstNumber: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  updatedAt: string
  pdfHash?: string
  ipfsUrls?: {
    pdf: string
  }
  adminAction?: {
    action: 'approved' | 'rejected'
    rejectionReason?: string
    adminNotes?: string
    actionDate: string
    adminId: string
  }
}

export interface AdminDashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  recentApplications: TheaterApplication[]
}

class AdminTheaterService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Get all pending theater applications
  async getPendingApplications(): Promise<TheaterApplication[]> {
    try {
      console.log('📋 Fetching pending theater applications...')
      const response = await this.api.get('/theater-requests')
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch applications')
      }
      
      console.log('✅ Fetched', response.data.total, 'pending applications')
      return response.data.data
    } catch (error) {
      console.error('❌ Error fetching pending applications:', error)
      throw error
    }
  }

  // Get specific theater application by ID
  async getApplicationById(id: string): Promise<TheaterApplication> {
    try {
      console.log('📋 Fetching theater application:', id)
      const response = await this.api.get(`/theater-requests/${id}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Application not found')
      }
      
      console.log('✅ Application fetched successfully')
      return response.data.data
    } catch (error) {
      console.error('❌ Error fetching application:', error)
      throw error
    }
  }

  // Approve theater application
  async approveApplication(id: string, adminNotes?: string): Promise<TheaterApplication> {
    try {
      console.log('✅ Approving theater application:', id)
      const response = await this.api.post(`/theater-requests/${id}/accept`, {
        adminNotes
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to approve application')
      }
      
      console.log('✅ Application approved successfully')
      return response.data.data
    } catch (error) {
      console.error('❌ Error approving application:', error)
      throw error
    }
  }

  // Reject theater application
  async rejectApplication(id: string, rejectionReason: string, adminNotes?: string): Promise<TheaterApplication> {
    try {
      console.log('❌ Rejecting theater application:', id)
      const response = await this.api.post(`/theater-requests/${id}/reject`, {
        rejectionReason,
        adminNotes
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject application')
      }
      
      console.log('❌ Application rejected successfully')
      return response.data.data
    } catch (error) {
      console.error('❌ Error rejecting application:', error)
      throw error
    }
  }

  // Get admin dashboard stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('📊 Fetching admin dashboard stats...')
      const response = await this.api.get('/dashboard/stats')
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch stats')
      }
      
      console.log('✅ Dashboard stats fetched successfully')
      return response.data.data
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      throw error
    }
  }

  // Get IPFS PDF URL
  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
}

export const adminTheaterService = new AdminTheaterService()