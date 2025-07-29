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
  private signer: ethers.Wallet | ethers.JsonRpcSigner | null = null
  private eventListeners: Map<string, any> = new Map()

  constructor() {
    const ganacheRPC = import.meta.env.VITE_GANACHE_RPC_URL || 'http://127.0.0.1:7545'
    this.provider = new ethers.JsonRpcProvider(ganacheRPC)

    const contractAddress = import.meta.env.VITE_USER_AUTH_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not configured')
    }

    this.contract = new ethers.Contract(contractAddress, USER_AUTH_ABI, this.provider)
  }

  async initialize(privateKey?: string) {
    try {
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider)
      } else {
        const accounts = await this.provider.listAccounts()
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner(accounts[0].address)
        } else {
          throw new Error('No accounts available in Ganache')
        }
      }

      this.contract = this.contract.connect(this.signer) as ethers.Contract
      return true
    } catch (error) {
      console.error('Failed to initialize Blockchain Logger:', error)
      return false
    }
  }

  async logSignup(uid: string, walletAddress: string): Promise<string | null> {
    if (!this.signer) {
      console.error('Blockchain Logger not initialized')
      return null
    }

    try {
      const exists = await this.contract.userExists(uid)
      if (exists) {
        throw new Error('User already signed up')
      }

      let gasEstimate
      try {
        gasEstimate = await this.contract.signup.estimateGas(uid, walletAddress, "Default Venue")
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }

      const tx = await this.contract.signup(uid, walletAddress, "Default Venue", {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })

      const receipt = await tx.wait()
      return receipt.hash
    } catch (error: any) {
      console.error('Failed to log signup:', error)

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

  async logLogin(uid: string): Promise<string | null> {
    if (!this.signer) {
      console.error('Blockchain Logger not initialized')
      return null
    }

    try {
      const exists = await this.contract.userExists(uid)
      if (!exists) {
        throw new Error('User must signup first before logging in')
      }

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

  async logLogout(uid: string): Promise<string | null> {
    console.log('🚪 Owner: Attempting to log logout for user:', uid)

    if (!this.signer) {
      console.error('❌ Owner: Blockchain Logger not initialized')
      return null
    }

    try {
      console.log('🔍 Owner: Checking if user exists...')
      const exists = await this.contract.userExists(uid)
      console.log('🔍 Owner: User exists:', exists)

      if (!exists) {
        throw new Error('User not found')
      }

      console.log('🔍 Owner: Checking if user is logged in...')
      const isLoggedIn = await this.contract.isUserLoggedIn(uid)
      console.log('🔍 Owner: User is logged in:', isLoggedIn)

      if (!isLoggedIn) {
        console.log('ℹ️ Owner: User is not logged in, skipping logout transaction')
        return null
      }

      let gasEstimate
      try {
        gasEstimate = await this.contract.logout.estimateGas(uid)
        console.log('⛽ Owner: Gas estimate:', gasEstimate.toString())
      } catch (gasError) {
        console.warn('⚠️ Owner: Gas estimation failed, using default:', gasError)
        gasEstimate = 300000n
      }

      console.log('📝 Owner: Sending logout transaction...')
      const tx = await this.contract.logout(uid, {
        gasLimit: gasEstimate + 50000n // Add buffer to gas estimate
      })

      console.log('⏳ Owner: Waiting for transaction receipt...')
      const receipt = await tx.wait()
      console.log('✅ Owner: Logout transaction successful:', receipt.hash)

      return receipt.hash
    } catch (error: any) {
      console.error('Failed to log logout:', error)

      if (error.message.includes('out of gas')) {
        throw new Error('Transaction failed: Insufficient gas. Please try again.')
      } else if (error.message.includes('User not logged in')) {
        return null
      } else {
        throw new Error(`Logout logging failed: ${error.message}`)
      }
    }
  }

  async getUserLogs(uid: string) {
    try {
      const exists = await this.contract.userExists(uid)
      if (!exists) return null

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

  async userExists(uid: string): Promise<boolean> {
    try {
      return await this.contract.userExists(uid)
    } catch (error) {
      console.error('Failed to check user existence:', error)
      return false
    }
  }

  async isUserLoggedIn(uid: string): Promise<boolean> {
    try {
      const exists = await this.contract.userExists(uid)
      if (!exists) return false
      return await this.contract.isUserLoggedIn(uid)
    } catch (error) {
      console.error('Failed to check user login status:', error)
      return false
    }
  }

  startEventListening(callback?: (event: any) => void) {
    this.contract.on('OwnerSignedUp', (uid, wallet, timestamp, venueName, event) => {
      callback?.({
        type: 'OwnerSignedUp',
        uid,
        wallet,
        timestamp: Number(timestamp),
        venueName,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      })
    })

    this.contract.on('OwnerLoggedIn', (uid, wallet, timestamp, loginCount, event) => {
      callback?.({
        type: 'OwnerLoggedIn',
        uid,
        wallet,
        timestamp: Number(timestamp),
        loginCount: Number(loginCount),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      })
    })

    this.contract.on('OwnerLoggedOut', (uid, wallet, timestamp, event) => {
      callback?.({
        type: 'OwnerLoggedOut',
        uid,
        wallet,
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      })
    })
  }

  stopEventListening() {
    this.contract.removeAllListeners()
    this.eventListeners.clear()
  }

  async getUserEvents(uid: string, fromBlock: number = 0) {
    try {
      const events = []

      // Get OwnerSignedUp events
      const signupFilter = this.contract.filters.OwnerSignedUp(uid)
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)

      for (const event of signupEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerSignedUp',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          venueName: eventLog.args[3],
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get OwnerLoggedIn events
      const loginFilter = this.contract.filters.OwnerLoggedIn(uid)
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)

      for (const event of loginEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerLoggedIn',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          loginCount: Number(eventLog.args[3]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get OwnerLoggedOut events
      const logoutFilter = this.contract.filters.OwnerLoggedOut(uid)
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)

      for (const event of logoutEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerLoggedOut',
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

  async getRecentEvents(blockRange: number = 100) {
    try {
      const currentBlock = await this.provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - blockRange)

      const events = []

      // Get all OwnerSignedUp events
      const signupFilter = this.contract.filters.OwnerSignedUp()
      const signupEvents = await this.contract.queryFilter(signupFilter, fromBlock)

      for (const event of signupEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerSignedUp',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          venueName: eventLog.args[3],
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all OwnerLoggedIn events
      const loginFilter = this.contract.filters.OwnerLoggedIn()
      const loginEvents = await this.contract.queryFilter(loginFilter, fromBlock)

      for (const event of loginEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerLoggedIn',
          uid: eventLog.args[0],
          wallet: eventLog.args[1],
          timestamp: Number(eventLog.args[2]),
          loginCount: Number(eventLog.args[3]),
          blockNumber: eventLog.blockNumber,
          transactionHash: eventLog.transactionHash,
          date: new Date(Number(eventLog.args[2]) * 1000).toLocaleString()
        })
      }

      // Get all OwnerLoggedOut events
      const logoutFilter = this.contract.filters.OwnerLoggedOut()
      const logoutEvents = await this.contract.queryFilter(logoutFilter, fromBlock)

      for (const event of logoutEvents) {
        const eventLog = event as ethers.EventLog
        events.push({
          type: 'OwnerLoggedOut',
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