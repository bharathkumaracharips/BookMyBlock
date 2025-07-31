import { ethers } from 'ethers'

// Theater Registry ABI - copied from Owner package
export const THEATER_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "uid", "type": "string"},
      {"internalType": "address", "name": "ownerWallet", "type": "address"},
      {"internalType": "string", "name": "ipfsHash", "type": "string"}
    ],
    "name": "submitApplication",
    "outputs": [{"internalType": "string", "name": "applicationId", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "applicationId", "type": "string"}],
    "name": "getApplication",
    "outputs": [
      {"internalType": "string", "name": "uid", "type": "string"},
      {"internalType": "address", "name": "ownerWallet", "type": "address"},
      {"internalType": "string", "name": "ipfsHash", "type": "string"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "submissionTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"},
      {"internalType": "string", "name": "reviewNotes", "type": "string"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "applicationId", "type": "string"},
      {"internalType": "uint8", "name": "newStatus", "type": "uint8"},
      {"internalType": "string", "name": "reviewNotes", "type": "string"}
    ],
    "name": "updateApplicationStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalApplications",
    "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "applicationId", "type": "string"},
      {"indexed": true, "internalType": "string", "name": "uid", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "ownerWallet", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ApplicationSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "applicationId", "type": "string"},
      {"indexed": false, "internalType": "uint8", "name": "oldStatus", "type": "uint8"},
      {"indexed": false, "internalType": "uint8", "name": "newStatus", "type": "uint8"},
      {"indexed": false, "internalType": "string", "name": "reviewNotes", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ApplicationStatusUpdated",
    "type": "event"
  }
]

export enum ApplicationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  UnderReview = 3
}

export interface BlockchainApplication {
  applicationId: string
  uid: string
  ownerWallet: string
  ipfsHash: string
  status: ApplicationStatus
  submissionTimestamp: number
  lastUpdated: number
  reviewNotes: string
  isActive: boolean
  transactionHash?: string
}

export class AdminTheaterRegistryService {
  private contract: ethers.Contract | null = null
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null

  async initialize(): Promise<boolean> {
    try {
      // Connect to Ganache
      const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
      this.provider = new ethers.JsonRpcProvider(ganacheRPC)
      
      // Use first Ganache account as admin
      const accounts = await this.provider.listAccounts()
      if (accounts.length === 0) {
        throw new Error('No accounts available in Ganache')
      }
      
      this.signer = await this.provider.getSigner(accounts[0].address)
      console.log('🔗 Admin using Ganache account:', await this.signer.getAddress())
      
      // Initialize contract with admin address
      const contractAddress = import.meta.env.VITE_THEATER_REGISTRY_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error('Theater Registry contract address not found in environment variables')
      }
      
      this.contract = new ethers.Contract(contractAddress, THEATER_REGISTRY_ABI, this.signer)
      console.log('✅ Admin TheaterRegistry contract initialized at:', contractAddress)
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Admin TheaterRegistry contract:', error)
      return false
    }
  }

  // Get all applications from blockchain events
  async getAllApplications(): Promise<BlockchainApplication[]> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized')
    }

    try {
      console.log('📡 Fetching all applications from blockchain...')
      
      // Get current block number and calculate range
      const currentBlock = await this.provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 50000) // Search last 50000 blocks
      
      console.log('📡 Searching from block:', fromBlock, 'to block:', currentBlock)

      // Query ApplicationSubmitted events
      const filter = this.contract.filters.ApplicationSubmitted()
      const events = await this.contract.queryFilter(filter, fromBlock, currentBlock)
      
      console.log('📡 Found application events:', events.length)
      
      // Since indexed string parameters are hashed, we need to get the total count
      // and iterate through all applications instead of relying on events
      console.log('📡 Getting total applications count...')
      const totalCount = await this.contract.getTotalApplications()
      console.log('📡 Total applications:', Number(totalCount))
      
      const applications: BlockchainApplication[] = []
      
      // Instead of parsing events, let's try to get applications by reconstructing IDs
      // The smart contract generates IDs as "APP_1", "APP_2", etc.
      for (let i = 1; i <= Number(totalCount); i++) {
        try {
          const applicationId = `APP_${i}`
          console.log('🔍 Trying to get application:', applicationId)
          
          // Get full application details from contract
          const details = await this.contract.getApplication(applicationId)
          
          // Find the corresponding event for transaction hash
          let transactionHash = ''
          for (const event of events) {
            const eventLog = event as ethers.EventLog
            const parsedEvent = this.contract.interface.parseLog(eventLog)
            if (parsedEvent && parsedEvent.args[2] === details[1]) { // Match by wallet address
              transactionHash = eventLog.transactionHash
              break
            }
          }
          
          applications.push({
            applicationId,
            uid: details[0],
            ownerWallet: details[1],
            ipfsHash: details[2],
            status: details[3],
            submissionTimestamp: Number(details[4]),
            lastUpdated: Number(details[5]),
            reviewNotes: details[6],
            isActive: details[7],
            transactionHash
          })
          
          console.log('✅ Successfully retrieved application:', applicationId)
        } catch (appError) {
          console.warn('⚠️ Failed to get application details for APP_' + i + ':', appError)
          continue
        }
      }
      
      console.log('✅ Retrieved applications:', applications.length)
      return applications
      
    } catch (error) {
      console.error('❌ Error fetching applications from blockchain:', error)
      return []
    }
  }

  // Get application details by ID
  async getApplicationDetails(applicationId: string): Promise<BlockchainApplication | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const details = await this.contract.getApplication(applicationId)
      
      return {
        applicationId,
        uid: details[0],
        ownerWallet: details[1],
        ipfsHash: details[2],
        status: details[3],
        submissionTimestamp: Number(details[4]),
        lastUpdated: Number(details[5]),
        reviewNotes: details[6],
        isActive: details[7]
      }
    } catch (error) {
      console.error('❌ Error getting application details:', error)
      return null
    }
  }

  // Update application status (admin only)
  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, reviewNotes: string): Promise<string | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      console.log('📝 Updating application status:', {
        applicationId,
        status,
        reviewNotes
      })

      // Estimate gas
      const gasEstimate = await this.contract.updateApplicationStatus.estimateGas(
        applicationId, 
        status, 
        reviewNotes
      )
      
      // Submit transaction
      const tx = await this.contract.updateApplicationStatus(
        applicationId, 
        status, 
        reviewNotes,
        {
          gasLimit: gasEstimate + 50000n // Add buffer
        }
      )

      console.log('⏳ Status update transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Status update confirmed:', receipt.hash)

      return receipt.hash
    } catch (error) {
      console.error('❌ Error updating application status:', error)
      throw error
    }
  }

  // Get total applications count
  async getTotalApplications(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    try {
      const count = await this.contract.getTotalApplications()
      return Number(count)
    } catch (error) {
      console.error('❌ Error getting total applications:', error)
      return 0
    }
  }

  getContract(): ethers.Contract | null {
    return this.contract
  }
}