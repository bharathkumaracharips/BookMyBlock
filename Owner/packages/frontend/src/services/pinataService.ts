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

  // Debug method to check credentials
  static debugCredentials() {
    const jwt = import.meta.env.VITE_PINATA_JWT
    const apiKey = import.meta.env.VITE_PINATA_API_KEY
    const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY

    console.log('🔍 Credential Debug:')
    console.log('JWT length:', jwt?.length || 0)
    console.log('JWT starts with:', jwt?.substring(0, 20) + '...')
    console.log('API Key:', apiKey)
    console.log('Secret Key length:', secretKey?.length || 0)
    
    if (jwt) {
      try {
        // Try to decode JWT header to check format
        const parts = jwt.split('.')
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]))
          console.log('JWT header:', header)
        }
      } catch (e) {
        console.error('Invalid JWT format:', e)
      }
    }
  }

  private static getHeaders() {
    const jwt = import.meta.env.VITE_PINATA_JWT
    const apiKey = import.meta.env.VITE_PINATA_API_KEY
    const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY

    console.log('🔑 Checking Pinata credentials...')
    console.log('JWT exists:', !!jwt)
    console.log('API Key exists:', !!apiKey)
    console.log('Secret Key exists:', !!secretKey)

    if (jwt) {
      console.log('✅ Using JWT authentication')
      return {
        'Authorization': `Bearer ${jwt}`
      }
    } else if (apiKey && secretKey) {
      console.log('✅ Using API Key authentication')
      return {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      }
    } else {
      throw new Error('Pinata credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY/VITE_PINATA_SECRET_API_KEY in .env file')
    }
  }

  static async uploadFile(file: Blob, metadata: PinataMetadata): Promise<PinataResponse> {
    try {
      console.log('📤 Starting file upload to Pinata...')
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)
      
      const formData = new FormData()
      formData.append('file', file, 'theater-application.txt') // Give it a proper filename
      
      const pinataMetadata = {
        name: metadata.name,
        keyvalues: metadata.keyvalues || {}
      }
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))

      const pinataOptions = {
        cidVersion: 1
      }
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      console.log('📋 Metadata:', pinataMetadata)
      
      const headers = this.getHeaders()
      console.log('🔑 Using headers:', Object.keys(headers))

      console.log('🌐 Making request to:', `${this.API_URL}/pinning/pinFileToIPFS`)
      
      const response = await axios.post(
        `${this.API_URL}/pinning/pinFileToIPFS`,
        formData,
        { 
          headers,
          timeout: 30000, // 30 second timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )

      console.log('✅ Upload successful:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error uploading to Pinata:', error)
      
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        console.error('Request config:', error.config)
        
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your Pinata credentials.')
        } else if (error.response?.status === 403) {
          throw new Error('Access forbidden. Please check your Pinata plan limits.')
        } else if (error.response?.status === 413) {
          throw new Error('File too large for upload.')
        } else {
          throw new Error(`Upload failed: ${error.response?.data?.error || error.message}`)
        }
      }
      
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
      console.log('🔍 Testing Pinata connection...')
      const headers = this.getHeaders()
      console.log('🔑 Test headers:', Object.keys(headers))
      
      const response = await axios.get(`${this.API_URL}/data/testAuthentication`, { 
        headers,
        timeout: 10000 // 10 second timeout
      })
      
      console.log('✅ Connection test successful:', response.data)
      return true
    } catch (error) {
      console.error('❌ Pinata connection test failed:', error)
      
      if (axios.isAxiosError(error)) {
        console.error('Test response status:', error.response?.status)
        console.error('Test response data:', error.response?.data)
        
        if (error.response?.status === 401) {
          console.error('❌ Authentication failed - invalid credentials')
        } else if (error.response?.status === 403) {
          console.error('❌ Access forbidden - check plan limits')
        }
      }
      
      return false
    }
  }
}