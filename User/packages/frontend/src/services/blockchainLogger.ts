import { ethers } from 'ethers'
import { USER_AUTH_ABI } from '../contracts/UserAuth'

/**
 * Blockchain Logger Service
 * 
 * Handles logging user activities to Ganache blockchain using Truffle deployment.
 * Provides direct connection to local Ganache for storing authentication logs.
 */
export class BlockchainLogger {
  private provider: ethers.JsonRpcProvider
  private contract: ethers.Contract
  private signer: ethers.Signer | null = null
  private eventListeners: Map<string, any> = new Map()

  constructor() {
    // Connect to local Ganache blockchain
    const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
    this.provider = new ethers.JsonRpcProvider(ganacheRPC)
    
    const contractAddress = import.meta.env.VITE_USER_AUTH_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not configured')
    }
    
    // Create contract instance (will add signer later)
    this.contract = new ethers.Contract(contractAddress, USER_AUTH_ABI, this.provider) as ethers.Contract
  }

  /**
   * Initialize with a signer (can be from Privy or a Ganache account)
   */
  async initialize(privateKey?: string) {
    try {
      if (privateKey) {
        // Use provided private key
        this.signer = new ethers.Wallet(privateKey, this.provider)
      } else {
        // Use first Ganache account as fallback
        const accounts = await this.provider.listAccounts()
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner(accounts[0].address)
        } else {
          throw new Error('No accounts available in Ganache')
        }
      }
      
      // Connect contract with signer
      this.contract = this.contract.connect(this.signer) as ethers.Contract
      
      return true
    } catch (error) {
      console.error('Failed to initialize Blockchain Logger:', error)
      return false
    }
  }

  /**
   * Log user signup activity
   */
  async logSignup(uid: string, walletAddress: string): Promise<string | null> {
    if (!this.signer) {
      console.error('Blockchain Logger not initialized')
      return null
    }

    try {
      // Check if user already exists
      const exists = await this.contract.userExists(uid)
      if (exists) {
        throw new Error('User already signed up')
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.signup.estimateGas(uid, walletAddress)
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.signup(uid, walletAddress, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      
      const receipt = await tx.wait()
      
      return receipt.hash
    } catch (error: any) {
      console.error('Failed to log signup:', error)
      
      // Provide more specific error messages
      if (error.message.includes('out of gas')) {
        throw new Error('Transaction failed: Insufficient gas. Please try again.')
      } else if (error.message.includes('User already signed up')) {
        throw new Error('User is already registered on the blockchain.')
      } else if (error.message.includes('Wallet already registered')) {
        throw new Error('This wallet is already registered to another user.')
      } else {
        throw new Error(`Signup logging failed: ${error.message}`)
      }
    }
  }

  /**
   * Log user login activity
   */
  async logLogin(uid: string): Promise<string | null> {
    if (!this.signer) {
      console.error('Blockchain Logger not initialized')
      return null
    }

    try {
      // First check if user exists
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        throw new Error('User must signup first before logging in')
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.login.estimateGas(uid)
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.login(uid, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      
      const receipt = await tx.wait()
      
      return receipt.hash
    } catch (error: any) {
      console.error('Failed to log login:', error)
      
      // Provide more specific error messages
      if (error.message.includes('out of gas')) {
        throw new Error('Transaction failed: Insufficient gas. Please try again.')
      } else if (error.message.includes('User not signed up')) {
        throw new Error('User must sign up first before logging in.')
      } else if (error.message.includes('User not logged in')) {
        throw new Error('User is already logged out.')
      } else {
        throw new Error(`Login logging failed: ${error.message}`)
      }
    }
  }

  /**
   * Log user logout activity
   */
  async logLogout(uid: string): Promise<string | null> {
    if (!this.signer) {
      console.error('Blockchain Logger not initialized')
      return null
    }

    try {
      // Check if user exists and is logged in
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        throw new Error('User not found')
      }
      
      const isLoggedIn = await this.contract.isUserLoggedIn(uid)
      if (!isLoggedIn) {
        return null
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.logout.estimateGas(uid)
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.logout(uid, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      
      const receipt = await tx.wait()
      
      return receipt.hash
    } catch (error: any) {
      console.error('Failed to log logout:', error)
      
      // Provide more specific error messages
      if (error.message.includes('out of gas')) {
        throw new Error('Transaction failed: Insufficient gas. Please try again.')
      } else if (error.message.includes('User not logged in')) {
        return null
      } else {
        throw new Error(`Logout logging failed: ${error.message}`)
      }
    }
  }

  /**
   * Get user activity logs from blockchain
   */
  async getUserLogs(uid: string) {
    try {
      // Check if user exists
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        return null
      }

      // Get user details
      const details = await this.contract.fetchUserDetails(uid)
      
      return {
        uid: details[0],
        walletAddress: details[1],
        isSignedUp: details[2],
        isLoggedIn: details[3],
        lastAction: details[4],
        lastTimestamp: Number(details[5]),
        loginCount: Number(details[6]),
        signupTimestamp: Number(details[7])
      }
    } catch (error: any) {
      console.error('Failed to get user logs:', error)
      return null
    }
  }

  /**
   * Check if user exists in blockchain logs
   */
  async userExists(uid: string): Promise<boolean> {
    try {
      return await this.contract.userExists(uid)
    } catch (error) {
      console.error('Failed to check user existence:', error)
      return false
    }
  }

  /**
   * Check if user is currently logged in on blockchain
   */
  async isUserLoggedIn(uid: string): Promise<boolean> {
    try {
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        return false
      }
      return await this.contract.isUserLoggedIn(uid)
    } catch (error) {
      console.error('Failed to check user login status:', error)
      return false
    }
  }

  /**
   * Start listening to contract events
   */
  startEventListening(callback?: (event: any) => void) {
    // Listen to UserSignedUp events
    this.contract.on('UserSignedUp', (uid, wallet, timestamp, event) => {
      const eventData = {
        type: 'UserSignedUp',
        uid,
        wallet,
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      }
      
      if (callback) callback(eventData)
    })

    // Listen to UserLoggedIn events
    this.contract.on('UserLoggedIn', (uid, wallet, timestamp, loginCount, event) => {
      const eventData = {
        type: 'UserLoggedIn',
        uid,
        wallet,
        timestamp: Number(timestamp),
        loginCount: Number(loginCount),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      }
      
      if (callback) callback(eventData)
    })

    // Listen to UserLoggedOut events
    this.contract.on('UserLoggedOut', (uid, wallet, timestamp, event) => {
      const eventData = {
        type: 'UserLoggedOut',
        uid,
        wallet,
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      }
      
      if (callback) callback(eventData)
    })
  }

  /**
   * Stop listening to contract events
   */
  stopEventListening() {
    this.contract.removeAllListeners()
    this.eventListeners.clear()
  }

  /**
   * Get historical events for a specific user
   */
  async getUserEvents(uid: string, fromBlock: number = 0) {
    try {
      const events = []

      // Get UserSignedUp events
      const signupFilter = this.contract.filters.UserSignedUp(uid)
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)
      
      for (const event of signupEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserSignedUp',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get UserLoggedIn events
      const loginFilter = this.contract.filters.UserLoggedIn(uid)
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)
      
      for (const event of loginEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserLoggedIn',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          loginCount: Number(eventLog.args[3]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get UserLoggedOut events
      const logoutFilter = this.contract.filters.UserLoggedOut(uid)
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)
      
      for (const event of logoutEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserLoggedOut',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Sort events by timestamp
      events.sort((a, b) => a.timestamp - b.timestamp)

      return events

    } catch (error: any) {
      console.error('Failed to fetch user events:', error)
      return []
    }
  }

  /**
   * Get all recent events (last 100 blocks)
   */
  async getRecentEvents(blockRange: number = 100) {
    try {
      const currentBlock = await this.provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - blockRange)

      const events = []

      // Get all UserSignedUp events
      const signupFilter = this.contract.filters.UserSignedUp()
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)
      
      for (const event of signupEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserSignedUp',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all UserLoggedIn events
      const loginFilter = this.contract.filters.UserLoggedIn()
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)
      
      for (const event of loginEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserLoggedIn',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          loginCount: Number(eventLog.args[3]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all UserLoggedOut events
      const logoutFilter = this.contract.filters.UserLoggedOut()
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)
      
      for (const event of logoutEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'UserLoggedOut',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Sort events by timestamp (most recent first)
      events.sort((a, b) => b.timestamp - a.timestamp)

      return events

    } catch (error: any) {
      console.error('Failed to fetch recent events:', error)
      return []
    }
  }

  /**
   * Test connection to Ganache and contract
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test basic connection
      const network = await this.provider.getNetwork()
      const blockNumber = await this.provider.getBlockNumber()
      
      // Test contract deployment
      const contractAddress = await this.contract.getAddress()
      const contractCode = await this.provider.getCode(contractAddress)
      
      if (contractCode === '0x') {
        console.error('Contract not found at address:', contractAddress)
        return false
      }
      
      return true
      
    } catch (error: any) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}