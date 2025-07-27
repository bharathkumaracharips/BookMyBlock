import { ethers } from 'ethers'

// UserAuth Contract ABI (simplified for key functions)
export const USER_AUTH_ABI = [
  "function signup(string uid, address walletAddress) public",
  "function login(string uid) public", 
  "function logout(string uid) public",
  "function fetchUserDetails(string uid) public view returns (string, address, bool, bool, string, uint256, uint256, uint256)",
  "function getUserByWallet(address walletAddress) public view returns (string)",
  "function userExists(string uid) public view returns (bool)",
  "function isUserLoggedIn(string uid) public view returns (bool)",
  "function getUserLoginCount(string uid) public view returns (uint256)",
  "event UserSignedUp(string indexed uid, address indexed wallet, uint256 timestamp)",
  "event UserLoggedIn(string indexed uid, address indexed wallet, uint256 timestamp, uint256 loginCount)",
  "event UserLoggedOut(string indexed uid, address indexed wallet, uint256 timestamp)"
]

// Contract address (update after Truffle deployment)
export const USER_AUTH_CONTRACT_ADDRESS = import.meta.env.VITE_USER_AUTH_CONTRACT_ADDRESS || ""

export interface UserDetails {
  uid: string
  walletAddress: string
  isSignedUp: boolean
  isLoggedIn: boolean
  lastAction: string
  lastTimestamp: number
  loginCount: number
  signupTimestamp: number
}

export class UserAuthContract {
  private contract: ethers.Contract
  private signer: ethers.Signer

  constructor(signer: ethers.Signer) {
    this.signer = signer
    
    if (!USER_AUTH_CONTRACT_ADDRESS) {
      throw new Error('USER_AUTH_CONTRACT_ADDRESS not configured. Please deploy contract and update .env file.')
    }
    
    this.contract = new ethers.Contract(USER_AUTH_CONTRACT_ADDRESS, USER_AUTH_ABI, signer)
  }

  /**
   * Sign up a new user
   */
  async signup(uid: string, walletAddress: string): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.signup(uid, walletAddress)
      return tx
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  /**
   * Login a user
   */
  async login(uid: string): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.login(uid)
      return tx
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  /**
   * Logout a user
   */
  async logout(uid: string): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.logout(uid)
      return tx
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(uid: string): Promise<UserDetails> {
    try {
      const result = await this.contract.fetchUserDetails(uid)
      return {
        uid: result[0],
        walletAddress: result[1],
        isSignedUp: result[2],
        isLoggedIn: result[3],
        lastAction: result[4],
        lastTimestamp: Number(result[5]),
        loginCount: Number(result[6]),
        signupTimestamp: Number(result[7])
      }
    } catch (error) {
      console.error('Failed to get user details:', error)
      throw error
    }
  }

  /**
   * Check if user exists
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
   * Check if user is logged in
   */
  async isUserLoggedIn(uid: string): Promise<boolean> {
    try {
      return await this.contract.isUserLoggedIn(uid)
    } catch (error) {
      console.error('Failed to check login status:', error)
      return false
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<string> {
    try {
      return await this.contract.getUserByWallet(walletAddress)
    } catch (error) {
      console.error('Failed to get user by wallet:', error)
      throw error
    }
  }
}