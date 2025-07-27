import { ethers } from 'ethers'
import { USER_AUTH_ABI } from '../contracts/UserAuth'

/**
 * Blockchain Logger Service
 * 
 * This service handles logging user activities to the Ganache blockchain
 * independently of Privy's authentication network. It uses a direct connection
 * to Ganache for storing activity logs.
 */
export class BlockchainLogger {
  private provider: ethers.JsonRpcProvider
  private contract: ethers.Contract
  private signer: ethers.Wallet | null = null

  constructor() {
    // Direct connection to Ganache
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
      
      const tx = await this.contract.signup(uid, walletAddress)
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
      throw new Error(`Signup logging failed: ${error.message}`)
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
      
      const tx = await this.contract.login(uid)
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
      throw new Error(`Login logging failed: ${error.message}`)
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
      
      const tx = await this.contract.logout(uid)
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
      throw new Error(`Logout logging failed: ${error.message}`)
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