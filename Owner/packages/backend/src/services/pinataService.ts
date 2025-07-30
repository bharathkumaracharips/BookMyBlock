import axios from 'axios'
import FormData from 'form-data'

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
        const jwt = process.env.PINATA_JWT
        const apiKey = process.env.PINATA_API_KEY
        const secretKey = process.env.PINATA_SECRET_API_KEY

        console.log('🔑 Pinata credentials check:')
        console.log('JWT exists:', !!jwt)
        console.log('API Key exists:', !!apiKey)
        console.log('Secret Key exists:', !!secretKey)

        // Try API key first, then JWT
        if (apiKey && secretKey) {
            console.log('✅ Using API Key authentication')
            return {
                'pinata_api_key': apiKey,
                'pinata_secret_api_key': secretKey
            }
        } else if (jwt) {
            console.log('✅ Using JWT authentication')
            return {
                'Authorization': `Bearer ${jwt}`
            }
        } else {
            throw new Error('Pinata credentials not configured')
        }
    }

    static async uploadFile(fileBuffer: Buffer, filename: string, metadata: PinataMetadata): Promise<PinataResponse> {
        try {
            const formData = new FormData()
            formData.append('file', fileBuffer, filename)

            console.log('📋 FormData details:')
            console.log('File buffer size:', fileBuffer.length)
            console.log('Filename:', filename)

            const pinataMetadata = {
                name: metadata.name,
                keyvalues: metadata.keyvalues || {}
            }
            formData.append('pinataMetadata', JSON.stringify(pinataMetadata))

            const pinataOptions = {
                cidVersion: 1
            }
            formData.append('pinataOptions', JSON.stringify(pinataOptions))

            const headers = {
                ...this.getHeaders(),
                ...formData.getHeaders()
            }

            const response = await axios.post(
                `${this.API_URL}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers,
                    timeout: 30000,
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            )

            return response.data
        } catch (error) {
            console.error('Error uploading file to Pinata:', error)

            if (axios.isAxiosError(error)) {
                console.error('Pinata API Error Details:')
                console.error('Status:', error.response?.status)
                console.error('Status Text:', error.response?.statusText)
                console.error('Response Data:', error.response?.data)
                console.error('Headers:', error.response?.headers)

                if (error.response?.status === 403) {
                    throw new Error('Pinata authentication failed. Please check your API credentials or account permissions.')
                } else if (error.response?.status === 429) {
                    throw new Error('Pinata rate limit exceeded. Please try again later.')
                } else if (error.response?.data?.error) {
                    throw new Error(`Pinata API Error: ${error.response.data.error.reason || error.response.data.error}`)
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

            const response = await axios.get(`${this.API_URL}/data/testAuthentication`, { headers })
            console.log('✅ Connection test response:', response.data)
            return true
        } catch (error) {
            console.error('❌ Pinata connection test failed:', error)

            if (axios.isAxiosError(error)) {
                console.error('Test Status:', error.response?.status)
                console.error('Test Response:', error.response?.data)
            }

            return false
        }
    }
}