import axios from 'axios'
import { TheaterFormData, Theater, TheaterStats } from '../types/theater'
import { TheaterRegistryService } from '../contracts/TheaterRegistry'
import { ethers } from 'ethers'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api'

class TheaterService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/theaters`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  private setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Submit theater registration
  async submitTheaterApplication(data: TheaterFormData, userId?: string): Promise<Theater> {
    console.log('🎯 Theater service received data:', data)
    console.log('📄 PDF Hash:', data.pdfHash)
    console.log('🔗 IPFS URL:', data.ipfsUrls)
    
    try {
      // Submit to backend admin API
      const response = await fetch(`${API_BASE_URL}/admin/theater-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to submit theater application')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit theater application')
      }

      console.log('✅ Theater application submitted successfully:', result.data.id)
      
      // Now submit to blockchain
      try {
        console.log('🔗 Submitting to blockchain...')
        await this.submitToBlockchain(data, result.data.id, userId)
        console.log('✅ Application also stored on blockchain')
      } catch (blockchainError) {
        console.error('⚠️ Backend submission succeeded but blockchain submission failed:', blockchainError)
        // Continue with backend success - blockchain submission is optional for now
      }
      
      // Convert backend response to Theater format
      const theater: Theater = {
        id: result.data.id,
        name: result.data.theaterName,
        location: `${result.data.city}, ${result.data.state}`,
        screens: result.data.numberOfScreens,
        totalSeats: result.data.totalSeats,
        status: result.data.status,
        createdAt: result.data.submittedAt,
        updatedAt: result.data.updatedAt,
        ownerName: result.data.ownerName,
        ownerEmail: result.data.ownerEmail,
        ownerPhone: result.data.ownerPhone,
        pdfHash: result.data.pdfHash,
        ipfsUrls: result.data.ipfsUrls
      }
      
      return theater
    } catch (error) {
      console.error('❌ Error submitting theater application:', error)
      throw error
    }
  }

  // Get owner's theaters from blockchain
  async getOwnerTheaters(userId?: string): Promise<Theater[]> {
    try {
      console.log('🔍 Fetching theaters from blockchain for user:', userId)
      
      // Get user ID if not provided
      const uid = userId || this.getUserId()
      if (!uid) {
        console.log('❌ No user ID available, returning empty array')
        return []
      }

      // Connect to Ganache
      const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
      const provider = new ethers.JsonRpcProvider(ganacheRPC)

      // Initialize TheaterRegistry contract (read-only, no signer needed)
      const theaterRegistry = new TheaterRegistryService()
      const accounts = await (provider as any).listAccounts()
      if (accounts.length === 0) {
        throw new Error('No accounts available in Ganache')
      }
      
      const signer = await (provider as any).getSigner(accounts[0].address)
      const initialized = await theaterRegistry.initialize(provider, signer)

      if (!initialized) {
        throw new Error('Failed to initialize TheaterRegistry contract')
      }

      // WORKAROUND: The smart contract has a bug where getUserApplications doesn't reflect
      // status updates made by admin. We need to:
      // 1. Get user applications to find application IDs
      // 2. Fetch each application individually to get the latest status

      console.log('📡 Step 1: Fetching user applications for UID:', uid)
      const userApps = await theaterRegistry.getUserApplications(uid)
      console.log('📡 Found user applications:', userApps.length)

      if (userApps.length === 0) {
        console.log('📡 No applications found for user')
        return []
      }

      // Step 2: For each application, find its ID and get the latest status
      console.log('📡 Step 2: Fetching latest status for each application...')
      const theaters: Theater[] = []

      for (let index = 0; index < userApps.length; index++) {
        const app = userApps[index]
        
        // Generate the application ID (this matches the smart contract logic)
        const applicationId = `APP_${index + 1}`
        
        console.log(`📡 Fetching latest status for ${applicationId}...`)
        
        try {
          // Get the latest application data by ID (this will have the updated status)
          const latestApp = await theaterRegistry.getApplication(applicationId)
          
          if (latestApp) {
            console.log(`📊 Application ${applicationId} latest status:`, {
              ipfsHash: latestApp.ipfsHash,
              status: latestApp.status,
              statusNumber: Number(latestApp.status),
              submissionTime: new Date(latestApp.submissionTimestamp * 1000).toLocaleString(),
              lastUpdated: new Date(latestApp.lastUpdated * 1000).toLocaleString()
            })

            // Try to get transaction hash from blockchain events
            const txHash = await this.getTransactionHashForApplication(latestApp.ipfsHash, theaterRegistry)
            
            const mappedStatus = this.mapBlockchainStatusToTheaterStatus(latestApp.status)
            
            console.log(`🎯 Final theater ${applicationId} conversion:`, {
              ipfsHash: latestApp.ipfsHash,
              rawStatus: latestApp.status,
              statusNumber: Number(latestApp.status),
              mappedStatus: mappedStatus,
              submissionTime: new Date(latestApp.submissionTimestamp * 1000).toLocaleString(),
              lastUpdated: new Date(latestApp.lastUpdated * 1000).toLocaleString()
            })
            
            theaters.push({
              id: `blockchain_${latestApp.ipfsHash}`, // Use IPFS hash as unique ID
              name: `Theater Application ${applicationId}`,
              location: 'View Application', // Simple text indicating they need to view the PDF
              screens: 1, // Default value
              totalSeats: 100, // Default value
              status: mappedStatus,
              createdAt: new Date(latestApp.submissionTimestamp * 1000).toISOString(),
              updatedAt: new Date(latestApp.lastUpdated * 1000).toISOString(),
              ownerName: 'View Application', // Indicate they need to view the PDF
              ownerEmail: 'View Application',
              ownerPhone: 'View Application',
              pdfHash: latestApp.ipfsHash,
              ipfsUrls: {
                pdf: `https://gateway.pinata.cloud/ipfs/${latestApp.ipfsHash}`
              },
              blockchainTxHash: txHash
            })
          } else {
            console.warn(`⚠️ Could not fetch latest status for ${applicationId}`)
            // Fallback to original app data
            const mappedStatus = this.mapBlockchainStatusToTheaterStatus(app.status)
            const txHash = await this.getTransactionHashForApplication(app.ipfsHash, theaterRegistry)
            
            theaters.push({
              id: `blockchain_${app.ipfsHash}`,
              name: `Theater Application ${applicationId}`,
              location: 'View Application',
              screens: 1,
              totalSeats: 100,
              status: mappedStatus,
              createdAt: new Date(app.submissionTimestamp * 1000).toISOString(),
              updatedAt: new Date(app.lastUpdated * 1000).toISOString(),
              ownerName: 'View Application',
              ownerEmail: 'View Application',
              ownerPhone: 'View Application',
              pdfHash: app.ipfsHash,
              ipfsUrls: {
                pdf: `https://gateway.pinata.cloud/ipfs/${app.ipfsHash}`
              },
              blockchainTxHash: txHash
            })
          }
        } catch (appError) {
          console.error(`❌ Error fetching ${applicationId}:`, appError)
          // Continue with next application
          continue
        }
      }

      console.log('✅ Final theaters with latest status:', theaters)
      return theaters

    } catch (error) {
      console.error('❌ Error fetching theaters from blockchain:', error)
      return []
    }
  }



  // Helper method to get transaction hash for an application from blockchain events
  private async getTransactionHashForApplication(ipfsHash: string, theaterRegistry: TheaterRegistryService): Promise<string | null> {
    try {
      console.log('🔍 Searching for transaction hash for IPFS:', ipfsHash)
      
      const contract = theaterRegistry.getContract()
      if (!contract) {
        console.error('❌ Contract not available')
        return null
      }

      // Get current block number and calculate range
      const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
      const provider = new ethers.JsonRpcProvider(ganacheRPC)
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10000) // Search last 10000 blocks or from block 0
      
      console.log('📡 Searching from block:', fromBlock, 'to block:', currentBlock)

      // Query ApplicationSubmitted events
      const filter = contract.filters.ApplicationSubmitted()
      const events = await contract.queryFilter(filter, fromBlock, currentBlock)
      
      console.log('📡 Found events:', events.length)
      
      // Find the event that matches our IPFS hash
      for (const event of events) {
        try {
          const eventLog = event as ethers.EventLog
          const parsedEvent = contract.interface.parseLog(eventLog)
          
          console.log('🔍 Event args:', parsedEvent?.args)
          
          if (parsedEvent && parsedEvent.args[3] === ipfsHash) { // args[3] is ipfsHash
            console.log('✅ Found matching event, transaction hash:', eventLog.transactionHash)
            return eventLog.transactionHash
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse event:', parseError)
          continue
        }
      }
      
      console.log('❌ No matching transaction found for IPFS hash:', ipfsHash)
      return null
      
    } catch (error) {
      console.error('❌ Error fetching transaction hash:', error)
      return null
    }
  }

  // Helper method to map blockchain status to theater status
  private mapBlockchainStatusToTheaterStatus(blockchainStatus: any): 'pending' | 'active' | 'inactive' | 'rejected' {
    const statusNumber = Number(blockchainStatus)
    console.log('🔄 Owner mapping blockchain status:', { 
      blockchainStatus, 
      statusNumber,
      willMapTo: statusNumber === 0 ? 'pending' : statusNumber === 1 ? 'active' : statusNumber === 2 ? 'rejected' : 'pending'
    })
    
    switch (statusNumber) {
      case 0: return 'pending'    // ApplicationStatus.Pending
      case 1: return 'active'     // ApplicationStatus.Approved
      case 2: return 'rejected'   // ApplicationStatus.Rejected
      case 3: return 'pending'    // ApplicationStatus.UnderReview (show as pending for owner)
      default: 
        console.warn('⚠️ Unknown blockchain status:', statusNumber)
        return 'pending'
    }
  }

  // Get application status by ID
  async getApplicationStatus(applicationId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/theater-requests/${applicationId}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch application status')
      }
      
      return result.data
    } catch (error) {
      console.error('Error fetching application status:', error)
      throw error
    }
  }

  // Get theater by ID
  async getTheaterById(id: string): Promise<Theater> {
    const response = await this.api.get(`/${id}`)
    return response.data
  }

  // Update theater
  async updateTheater(id: string, data: Partial<Theater>): Promise<Theater> {
    const response = await this.api.put(`/${id}`, data)
    return response.data
  }

  // Delete theater
  async deleteTheater(id: string): Promise<void> {
    await this.api.delete(`/${id}`)
  }

  // Get theater stats
  async getTheaterStats(): Promise<TheaterStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch stats')
      }
      
      // Convert backend stats to frontend format
      const stats: TheaterStats = {
        totalTheaters: result.data.totalApplications || 0,
        activeTheaters: result.data.approvedApplications || 0,
        totalScreens: 0, // Not available from backend yet
        totalSeats: 0    // Not available from backend yet
      }
      
      return stats
    } catch (error) {
      console.error('Error fetching theater stats:', error)
      // Return default stats if API fails
      return {
        totalTheaters: 0,
        activeTheaters: 0,
        totalScreens: 0,
        totalSeats: 0
      }
    }
  }

  // Upload additional documents
  async uploadDocument(theaterId: string, documentType: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', documentType)
    
    const response = await this.api.post(`/${theaterId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.url
  }

  // Get theater documents
  async getTheaterDocuments(theaterId: string): Promise<any[]> {
    const response = await this.api.get(`/${theaterId}/documents`)
    return response.data
  }

  // Submit to blockchain using Ganache first account
  private async submitToBlockchain(data: TheaterFormData, backendId: string, userId?: string): Promise<string> {
    try {
      // Connect to Ganache directly
      const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
      const provider = new ethers.JsonRpcProvider(ganacheRPC)

      // Get the first account from Ganache (default sender)
      const accounts = await provider.listAccounts()
      if (accounts.length === 0) {
        throw new Error('No accounts available in Ganache')
      }

      const signer = await provider.getSigner(accounts[0].address)
      const senderAddress = await signer.getAddress()

      console.log('🔗 Using Ganache account:', senderAddress)
      console.log('🔗 Ganache RPC:', ganacheRPC)

      // Initialize TheaterRegistry contract
      const theaterRegistry = new TheaterRegistryService()
      const initialized = await theaterRegistry.initialize(provider, signer)

      if (!initialized) {
        throw new Error('Failed to initialize TheaterRegistry contract')
      }

      // Use the provided user ID or try to get it from storage
      console.log('🔍 Received userId parameter:', userId)
      const uid = userId || this.getUserId()
      console.log('🔍 Final UID to use:', uid)
      
      if (!uid) {
        console.error('❌ No UID available - userId param:', userId, 'getUserId():', this.getUserId())
        throw new Error('User ID not found - user must be authenticated')
      }

      // For the ownerWallet parameter, we'll use the Privy user's embedded wallet address if available
      // or fallback to the Ganache sender address
      const ownerWallet = this.getUserWalletAddress() || senderAddress

      console.log('📝 Submitting to blockchain:')
      console.log('- UID:', uid)
      console.log('- Owner Wallet:', ownerWallet)
      console.log('- IPFS Hash:', data.pdfHash)
      console.log('- Sender (Ganache):', senderAddress)

      // Submit to blockchain with UID, owner wallet address, and IPFS hash
      const result = await theaterRegistry.submitApplication(
        uid,
        ownerWallet,
        data.pdfHash || ''
      )

      // Parse the result to get application ID and transaction hash
      const [applicationId, transactionHash] = result.split('|')
      console.log('✅ Blockchain application ID:', applicationId)
      console.log('✅ Blockchain transaction hash:', transactionHash)
      
      return { applicationId, transactionHash }

    } catch (error) {
      console.error('❌ Blockchain submission error:', error)
      throw error
    }
  }

  // Helper method to get user's wallet address from Privy
  private getUserWalletAddress(): string | null {
    try {
      // Try to get from localStorage where Privy might store wallet info
      const privyData = localStorage.getItem('privy:user')
      if (privyData) {
        const user = JSON.parse(privyData)
        // Look for embedded wallet address
        if (user.linkedAccounts) {
          const wallet = user.linkedAccounts.find((account: any) => 
            account.type === 'wallet' || account.type === 'embedded_wallet'
          )
          if (wallet && wallet.address) {
            return wallet.address
          }
        }
      }
      return null
    } catch {
      return null
    }
  }

  // Helper method to get user ID from Privy storage
  private getUserId(): string | null {
    try {
      // Try multiple storage locations where Privy might store user data
      const storageKeys = [
        'privy:user',
        'privy:session',
        'privy:auth_state',
        'privy:identity'
      ]
      
      for (const key of storageKeys) {
        const userData = localStorage.getItem(key)
        if (userData) {
          console.log(`🔍 Found data in ${key}:`, userData.substring(0, 100) + '...')
          const user = JSON.parse(userData)
          
          // Try different possible locations for user ID
          const possibleIds = [
            user.id,
            user.user?.id,
            user.userId,
            user.sub,
            user.identity?.id
          ]
          
          for (const id of possibleIds) {
            if (id && typeof id === 'string') {
              console.log(`✅ Found user ID in ${key}:`, id)
              return id
            }
          }
        }
      }
      
      console.log('❌ No user ID found in any storage location')
      return null
    } catch (error) {
      console.error('❌ Error getting user ID from storage:', error)
      return null
    }
  }
}

export const theaterService = new TheaterService()