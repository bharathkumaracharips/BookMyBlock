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
  private signer: ethers.Wallet | null = null
  private eventListeners: Map<string, any> = new Map()

  constructor() {
    // Connect to local Ganache blockchain
    const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
    this.provider = new ethers.JsonRpcProvider(ganacheRPC)
    
    const contractAddress = import.meta.env.VITE_USER_AUTH_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not configured')
    }
    
    console.log('🔧 BlockchainLogger initialized with:', {
      ganacheRPC,
      contractAddress,
      timestamp: new Date().toISOString()
    })
    
    // Create contract instance (will add signer later)
    this.contract = new ethers.Contract(contractAddress, USER_AUTH_ABI, this.provider)
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
      this.contract = this.contract.connect(this.signer)
      
      console.log('✅ Blockchain Logger initialized:', {
        signerAddress: await this.signer.getAddress(),
        contractAddress: await this.contract.getAddress(),
        ganacheRPC: this.provider._getConnection().url
      })
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Blockchain Logger:', error)
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
      console.log('📝 Logging signup to blockchain:', { uid, walletAddress })
      
      // Check if user already exists
      const exists = await this.contract.userExists(uid)
      if (exists) {
        throw new Error('User already signed up')
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.signup.estimateGas(uid, walletAddress)
        console.log('Gas estimate:', gasEstimate.toString())
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.signup(uid, walletAddress, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      console.log('Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('✅ Signup logged to blockchain:', {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      })
      
      return receipt.hash
    } catch (error: any) {
      console.error('❌ Failed to log signup:', error)
      
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
      console.log('📝 Logging login to blockchain:', { uid })
      
      // First check if user exists
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        throw new Error('User must signup first before logging in')
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.login.estimateGas(uid)
        console.log('Gas estimate:', gasEstimate.toString())
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.login(uid, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      console.log('Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('✅ Login logged to blockchain:', {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      })
      
      return receipt.hash
    } catch (error: any) {
      console.error('❌ Failed to log login:', error)
      
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
      console.log('📝 Logging logout to blockchain:', { uid })
      
      // Check if user exists and is logged in
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        throw new Error('User not found')
      }
      
      const isLoggedIn = await this.contract.isUserLoggedIn(uid)
      if (!isLoggedIn) {
        console.log('User is already logged out, skipping transaction')
        return null
      }
      
      // Estimate gas first
      let gasEstimate
      try {
        gasEstimate = await this.contract.logout.estimateGas(uid)
        console.log('Gas estimate:', gasEstimate.toString())
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }
      
      const tx = await this.contract.logout(uid, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })
      console.log('Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('✅ Logout logged to blockchain:', {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      })
      
      return receipt.hash
    } catch (error: any) {
      console.error('❌ Failed to log logout:', error)
      
      // Provide more specific error messages
      if (error.message.includes('out of gas')) {
        throw new Error('Transaction failed: Insufficient gas. Please try again.')
      } else if (error.message.includes('User not logged in')) {
        console.log('User already logged out, no transaction needed')
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
      console.error('❌ Failed to get user logs:', error)
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
    console.log('🎧 Starting to listen for blockchain events...')

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
      
      console.log('🔔 UserSignedUp Event:', eventData)
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
      
      console.log('🔔 UserLoggedIn Event:', eventData)
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
      
      console.log('🔔 UserLoggedOut Event:', eventData)
      if (callback) callback(eventData)
    })

    console.log('✅ Event listeners started for all user activities')
  }

  /**
   * Stop listening to contract events
   */
  stopEventListening() {
    console.log('🔇 Stopping event listeners...')
    this.contract.removeAllListeners()
    this.eventListeners.clear()
  }

  /**
   * Get historical events for a specific user
   */
  async getUserEvents(uid: string, fromBlock: number = 0) {
    try {
      console.log(`🔍 Fetching historical events for user: ${uid}`)

      const events = []

      // Get UserSignedUp events
      const signupFilter = this.contract.filters.UserSignedUp(uid)
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)
      
      for (const event of signupEvents) {
        events.push({
          type: 'UserSignedUp',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Get UserLoggedIn events
      const loginFilter = this.contract.filters.UserLoggedIn(uid)
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)
      
      for (const event of loginEvents) {
        events.push({
          type: 'UserLoggedIn',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          loginCount: Number(event.args[3]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Get UserLoggedOut events
      const logoutFilter = this.contract.filters.UserLoggedOut(uid)
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)
      
      for (const event of logoutEvents) {
        events.push({
          type: 'UserLoggedOut',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Sort events by timestamp
      events.sort((a, b) => a.timestamp - b.timestamp)

      console.log(`✅ Found ${events.length} historical events for user ${uid}`)
      return events

    } catch (error: any) {
      console.error('❌ Failed to fetch user events:', error)
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

      console.log(`🔍 Fetching recent events from block ${fromBlock} to ${currentBlock}`)

      const events = []

      // Get all UserSignedUp events
      const signupFilter = this.contract.filters.UserSignedUp()
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)
      
      for (const event of signupEvents) {
        events.push({
          type: 'UserSignedUp',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all UserLoggedIn events
      const loginFilter = this.contract.filters.UserLoggedIn()
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)
      
      for (const event of loginEvents) {
        events.push({
          type: 'UserLoggedIn',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          loginCount: Number(event.args[3]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all UserLoggedOut events
      const logoutFilter = this.contract.filters.UserLoggedOut()
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)
      
      for (const event of logoutEvents) {
        events.push({
          type: 'UserLoggedOut',
          uid: event.args[0],
          wallet: event.args[1],
          timestamp: Number(event.args[2]),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          date: new Date(Number(event.args[2]) * 1000).toLocaleString()
        })
      }

      // Sort events by timestamp (most recent first)
      events.sort((a, b) => b.timestamp - a.timestamp)

      console.log(`✅ Found ${events.length} recent events`)
      return events

    } catch (error: any) {
      console.error('❌ Failed to fetch recent events:', error)
      return []
    }
  }

  /**
   * Test connection to Ganache and contract
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Ganache connection...')
      
      // Test basic connection
      const network = await this.provider.getNetwork()
      const blockNumber = await this.provider.getBlockNumber()
      
      console.log('✅ Ganache connection successful:')
      console.log('- RPC URL:', this.provider._getConnection().url)
      console.log('- Chain ID:', Number(network.chainId))
      console.log('- Block Number:', blockNumber)
      
      // Test contract deployment
      const contractAddress = await this.contract.getAddress()
      const contractCode = await this.provider.getCode(contractAddress)
      
      console.log('🔍 Testing contract deployment...')
      console.log('- Contract Address:', contractAddress)
      console.log('- Contract Code Length:', contractCode.length)
      console.log('- Contract Deployed:', contractCode !== '0x')
      
      if (contractCode === '0x') {
        console.error('❌ Contract not found at address:', contractAddress)
        console.error('💡 Run: cd User/packages/contracts && truffle migrate --reset')
        return false
      }
      
      console.log('✅ All connection tests passed!')
      return true
      
    } catch (error: any) {
      console.error('❌ Connection test failed:', error)
      
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Ganache is not running. Start it with:')
        console.error('   ganache-cli --port 7545 --deterministic')
      } else if (error.message.includes('network')) {
        console.error('💡 Network connection issue. Check Ganache is running on port 7545')
      }
      
      return false
    }
  }
}