import { ethers } from 'ethers'
import UserAuthContract from '../../../contracts/build/contracts/UserAuth.json'

export const USER_AUTH_ABI = UserAuthContract.abi

export interface UserDetails {
  uid: string
  walletAddress: string
  isSignedUp: boolean
  isLoggedIn: boolean
  lastAction: string
  signupTimestamp: number
  lastActionTimestamp: number
  loginCount: number
}

export class UserAuthContractService {
  private contract: ethers.Contract | null = null
  private signer: ethers.Signer | null = null

  async initialize(signer: ethers.Signer): Promise<boolean> {
    try {
      this.signer = signer
      
      // Get contract address from networks, with fallback
      const networks = UserAuthContract.networks as any
      const contractAddress = networks[1337]?.address || networks[5777]?.address || ''
      
      if (!contractAddress) {
        throw new Error('Contract address not found in networks')
      }
      
      this.contract = new ethers.Contract(
        contractAddress,
        USER_AUTH_ABI,
        signer
      )
      return true
    } catch (error) {
      console.error('Failed to initialize UserAuth contract:', error)
      return false
    }
  }

  async signup(uid: string, walletAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    const tx = await this.contract.signup(uid, walletAddress)
    const receipt = await tx.wait()
    return receipt.hash
  }

  async login(uid: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    const tx = await this.contract.login(uid)
    const receipt = await tx.wait()
    return receipt.hash
  }

  async logout(uid: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    const tx = await this.contract.logout(uid)
    const receipt = await tx.wait()
    return receipt.hash
  }

  async getUserDetails(uid: string): Promise<UserDetails | null> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    try {
      const details = await this.contract.fetchUserDetails(uid)
      return {
        uid: details[0],
        walletAddress: details[1],
        isSignedUp: details[2],
        isLoggedIn: details[3],
        lastAction: details[4],
        signupTimestamp: Number(details[5]),
        lastActionTimestamp: Number(details[6]),
        loginCount: Number(details[7])
      }
    } catch (error) {
      console.error('Failed to get user details:', error)
      return null
    }
  }

  async userExists(uid: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    try {
      return await this.contract.userExists(uid)
    } catch (error) {
      console.error('Failed to check if user exists:', error)
      return false
    }
  }

  async isUserLoggedIn(uid: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    try {
      return await this.contract.isUserLoggedIn(uid)
    } catch (error) {
      console.error('Failed to check if user is logged in:', error)
      return false
    }
  }

  async getUserLoginCount(uid: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    try {
      const count = await this.contract.getUserLoginCount(uid)
      return Number(count)
    } catch (error) {
      console.error('Failed to get user login count:', error)
      return 0
    }
  }

  async getUserByWallet(walletAddress: string): Promise<string | null> {
    if (!this.contract) throw new Error('Contract not initialized')
    
    try {
      const uid = await this.contract.getUserByWallet(walletAddress)
      return uid || null
    } catch (error) {
      console.error('Failed to get user by wallet:', error)
      return null
    }
  }

  getContract(): ethers.Contract | null {
    return this.contract
  }
} 