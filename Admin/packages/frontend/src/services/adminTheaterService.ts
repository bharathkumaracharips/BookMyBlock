import { AdminTheaterRegistryService, ApplicationStatus, BlockchainApplication } from '../contracts/TheaterRegistry'

export interface TheaterApplication {
  id: string
  applicationId: string
  uid: string
  ownerWallet: string
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
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  submittedAt: string
  updatedAt: string
  pdfHash?: string
  ipfsUrls?: {
    pdf: string
  }
  transactionHash?: string
  adminAction?: {
    action: 'approved' | 'rejected'
    rejectionReason?: string
    adminNotes?: string
    actionDate: string
    adminId: string
  }
  reviewNotes?: string
}

export interface AdminDashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  underReviewApplications: number
  recentApplications: TheaterApplication[]
}

class AdminTheaterService {
  private registryService = new AdminTheaterRegistryService()

  // Helper method to convert blockchain application to UI format
  private convertBlockchainToUI(app: BlockchainApplication): TheaterApplication {
    return {
      id: app.applicationId,
      applicationId: app.applicationId,
      uid: app.uid,
      ownerWallet: app.ownerWallet,
      theaterName: `Theater Application`, // Will be fetched from IPFS if needed
      ownerName: 'View Application', // Will be fetched from IPFS if needed
      ownerEmail: 'View Application',
      ownerPhone: 'View Application',
      address: 'View Application',
      city: 'View Application',
      state: 'View Application',
      pincode: 'View Application',
      numberOfScreens: 1, // Default values
      totalSeats: 100,
      parkingSpaces: 10,
      gstNumber: 'View Application',
      status: this.mapBlockchainStatusToUI(app.status),
      submittedAt: new Date(app.submissionTimestamp * 1000).toISOString(),
      updatedAt: new Date(app.lastUpdated * 1000).toISOString(),
      pdfHash: app.ipfsHash,
      ipfsUrls: {
        pdf: `https://gateway.pinata.cloud/ipfs/${app.ipfsHash}`
      },
      transactionHash: app.transactionHash,
      reviewNotes: app.reviewNotes
    }
  }

  // Helper method to map blockchain status to UI status
  private mapBlockchainStatusToUI(status: ApplicationStatus): 'pending' | 'approved' | 'rejected' | 'under_review' {
    switch (status) {
      case ApplicationStatus.Pending: return 'pending'
      case ApplicationStatus.Approved: return 'approved'
      case ApplicationStatus.Rejected: return 'rejected'
      case ApplicationStatus.UnderReview: return 'under_review'
      default: return 'pending'
    }
  }

  // Get all pending theater applications from blockchain
  async getPendingApplications(): Promise<TheaterApplication[]> {
    try {
      console.log('📋 Fetching pending theater applications from blockchain...')

      await this.registryService.initialize()
      const allApplications = await this.registryService.getAllApplications()

      // Filter for pending applications
      const pendingApps = allApplications
        .filter(app => app.status === ApplicationStatus.Pending)
        .map(app => this.convertBlockchainToUI(app))

      console.log('✅ Fetched', pendingApps.length, 'pending applications from blockchain')
      return pendingApps
    } catch (error) {
      console.error('❌ Error fetching pending applications from blockchain:', error)
      throw error
    }
  }

  // Get all applications (for dashboard stats)
  async getAllApplications(): Promise<TheaterApplication[]> {
    try {
      console.log('📋 Fetching all theater applications from blockchain...')

      await this.registryService.initialize()
      const allApplications = await this.registryService.getAllApplications()

      const uiApplications = allApplications.map(app => this.convertBlockchainToUI(app))

      console.log('✅ Fetched', uiApplications.length, 'total applications from blockchain')
      return uiApplications
    } catch (error) {
      console.error('❌ Error fetching all applications from blockchain:', error)
      throw error
    }
  }

  // Get specific theater application by ID from blockchain
  async getApplicationById(applicationId: string): Promise<TheaterApplication> {
    try {
      console.log('📋 Fetching theater application from blockchain:', applicationId)

      await this.registryService.initialize()
      const app = await this.registryService.getApplicationDetails(applicationId)

      if (!app) {
        throw new Error('Application not found on blockchain')
      }

      console.log('✅ Application fetched successfully from blockchain')
      return this.convertBlockchainToUI(app)
    } catch (error) {
      console.error('❌ Error fetching application from blockchain:', error)
      throw error
    }
  }

  // Approve theater application on blockchain
  async approveApplication(applicationId: string, adminNotes?: string): Promise<TheaterApplication> {
    try {
      console.log('✅ Approving theater application on blockchain:', applicationId)

      await this.registryService.initialize()

      const txHash = await this.registryService.updateApplicationStatus(
        applicationId,
        ApplicationStatus.Approved,
        adminNotes || 'Application approved by admin'
      )

      console.log('✅ Application approved on blockchain, tx:', txHash)

      // Fetch updated application details
      const updatedApp = await this.registryService.getApplicationDetails(applicationId)
      if (!updatedApp) {
        throw new Error('Failed to fetch updated application')
      }

      return this.convertBlockchainToUI(updatedApp)
    } catch (error) {
      console.error('❌ Error approving application on blockchain:', error)
      throw error
    }
  }

  // Reject theater application on blockchain
  async rejectApplication(applicationId: string, rejectionReason: string, adminNotes?: string): Promise<TheaterApplication> {
    try {
      console.log('❌ Rejecting theater application on blockchain:', applicationId)

      await this.registryService.initialize()

      const notes = `Rejection Reason: ${rejectionReason}${adminNotes ? `. Admin Notes: ${adminNotes}` : ''}`

      const txHash = await this.registryService.updateApplicationStatus(
        applicationId,
        ApplicationStatus.Rejected,
        notes
      )

      console.log('❌ Application rejected on blockchain, tx:', txHash)

      // Fetch updated application details
      const updatedApp = await this.registryService.getApplicationDetails(applicationId)
      if (!updatedApp) {
        throw new Error('Failed to fetch updated application')
      }

      return this.convertBlockchainToUI(updatedApp)
    } catch (error) {
      console.error('❌ Error rejecting application on blockchain:', error)
      throw error
    }
  }

  // Set application under review on blockchain
  async setUnderReview(applicationId: string, adminNotes?: string): Promise<TheaterApplication> {
    try {
      console.log('🔍 Setting application under review on blockchain:', applicationId)

      await this.registryService.initialize()

      const txHash = await this.registryService.updateApplicationStatus(
        applicationId,
        ApplicationStatus.UnderReview,
        adminNotes || 'Application is under review'
      )

      console.log('🔍 Application set under review on blockchain, tx:', txHash)

      // Fetch updated application details
      const updatedApp = await this.registryService.getApplicationDetails(applicationId)
      if (!updatedApp) {
        throw new Error('Failed to fetch updated application')
      }

      return this.convertBlockchainToUI(updatedApp)
    } catch (error) {
      console.error('❌ Error setting application under review on blockchain:', error)
      throw error
    }
  }

  // Get admin dashboard stats from blockchain
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('📊 Fetching admin dashboard stats from blockchain...')

      const allApplications = await this.getAllApplications()

      const stats: AdminDashboardStats = {
        totalApplications: allApplications.length,
        pendingApplications: allApplications.filter(app => app.status === 'pending').length,
        approvedApplications: allApplications.filter(app => app.status === 'approved').length,
        rejectedApplications: allApplications.filter(app => app.status === 'rejected').length,
        underReviewApplications: allApplications.filter(app => app.status === 'under_review').length,
        recentApplications: allApplications
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5)
      }

      console.log('✅ Dashboard stats calculated from blockchain data')
      return stats
    } catch (error) {
      console.error('❌ Error fetching dashboard stats from blockchain:', error)
      throw error
    }
  }

  // Get IPFS PDF URL
  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }

  // Get blockchain transaction URL (for Ganache, this would be a block explorer if available)
  getTransactionUrl(txHash: string): string {
    // For Ganache, you might want to implement a simple block explorer
    // For now, just return the hash
    return txHash
  }

  // Copy text to clipboard helper
  async copyToClipboard(text: string, label: string = 'Text'): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`📋 Copied ${label} to clipboard:`, text)
    } catch (error) {
      console.error(`❌ Failed to copy ${label} to clipboard:`, error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }
}

export const adminTheaterService = new AdminTheaterService()