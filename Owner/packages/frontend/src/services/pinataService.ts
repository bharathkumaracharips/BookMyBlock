import axios from 'axios'

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface PinataMetadata {
  name: string
  keyvalues?: Record<string, string>
}

export class PinataService {
  private static readonly API_URL = 'https://api.pinata.cloud'
  private static readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs'

  private static getHeaders() {
    const apiKey = import.meta.env.VITE_PINATA_API_KEY
    const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY
    const jwt = import.meta.env.VITE_PINATA_JWT

    if (jwt) {
      return {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    } else if (apiKey && secretKey) {
      return {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey,
        'Content-Type': 'application/json'
      }
    } else {
      throw new Error('Pinata credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY/VITE_PINATA_SECRET_API_KEY in .env file')
    }
  }

  static async uploadFile(file: Blob, metadata: PinataMetadata): Promise<PinataResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const pinataMetadata = {
        name: metadata.name,
        keyvalues: metadata.keyvalues || {}
      }
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))

      const pinataOptions = {
        cidVersion: 1
      }
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const headers = this.getHeaders()
      const { 'Content-Type': _, ...fileHeaders } = headers // Remove Content-Type for FormData

      const response = await axios.post(
        `${this.API_URL}/pinning/pinFileToIPFS`,
        formData,
        { headers: fileHeaders }
      )

      return response.data
    } catch (error) {
      console.error('Error uploading to Pinata:', error)
      throw new Error('Failed to upload file to IPFS')
    }
  }

  static async uploadJSON(jsonData: any, metadata: PinataMetadata): Promise<PinataResponse> {
    try {
      const data = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name,
          keyvalues: metadata.keyvalues || {}
        },
        pinataOptions: {
          cidVersion: 1
        }
      }

      const response = await axios.post(
        `${this.API_URL}/pinning/pinJSONToIPFS`,
        data,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error)
      throw new Error('Failed to upload JSON to IPFS')
    }
  }

  static getIPFSUrl(hash: string): string {
    return `${this.GATEWAY_URL}/${hash}`
  }

  static async testConnection(): Promise<boolean> {
    try {
      const headers = this.getHeaders()
      await axios.get(`${this.API_URL}/data/testAuthentication`, { headers })
      return true
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }
}