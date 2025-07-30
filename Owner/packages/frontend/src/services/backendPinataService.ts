interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface PinataMetadata {
  name: string
  keyvalues?: Record<string, string>
}

export class BackendPinataService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'

  static debugCredentials() {
    console.log('🔍 Using backend proxy for IPFS uploads')
    console.log('Backend URL:', this.API_BASE_URL)
    console.log('Test endpoint:', `${this.API_BASE_URL}/api/ipfs/test`)
    console.log('Upload endpoint:', `${this.API_BASE_URL}/api/ipfs/upload-file`)
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing backend IPFS connection...')
      
      const response = await fetch(`${this.API_BASE_URL}/api/ipfs/test`)
      const result = await response.json()
      
      console.log('Backend IPFS test result:', result)
      return result.success
    } catch (error) {
      console.error('❌ Backend IPFS connection test failed:', error)
      return false
    }
  }

  static async uploadFile(file: Blob, metadata: PinataMetadata): Promise<PinataResponse> {
    try {
      console.log('📤 Uploading file via backend...')
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)
      console.log('📋 Metadata:', metadata)

      const formData = new FormData()
      formData.append('file', file, 'theater-application.txt')
      formData.append('name', metadata.name)
      if (metadata.keyvalues) {
        formData.append('keyvalues', JSON.stringify(metadata.keyvalues))
      }

      const response = await fetch(`${this.API_BASE_URL}/api/ipfs/upload-file`, {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Upload response status:', response.status)
      console.log('📡 Upload response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Upload response error:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `Upload failed with status ${response.status}`)
        } catch {
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
        }
      }

      const result = await response.json()
      console.log('📡 Upload response data:', result)
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      console.log('✅ File uploaded successfully via backend:', result.data.IpfsHash)
      return result.data
    } catch (error) {
      console.error('❌ Error uploading file via backend:', error)
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async uploadJSON(jsonData: any, metadata: PinataMetadata): Promise<PinataResponse> {
    try {
      console.log('📤 Uploading JSON via backend...')
      console.log('📋 JSON data size:', JSON.stringify(jsonData).length, 'characters')
      console.log('📋 Metadata:', metadata)

      const response = await fetch(`${this.API_BASE_URL}/api/ipfs/upload-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jsonData,
          metadata
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed')
      }

      console.log('✅ JSON uploaded successfully via backend:', result.data.IpfsHash)
      return result.data
    } catch (error) {
      console.error('❌ Error uploading JSON via backend:', error)
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
}