import axios from 'axios'
import { TheaterSeatLayout } from '../types/seatLayout'

// Use the same working Pinata configuration as the existing IPFS service
const PINATA_API_KEY = '801420ef88d144bbd41c'
const PINATA_SECRET_KEY = '17787c717e33c6555e236e8b5a5f2c6f93effb8ed6858f9051a4bf8c22142fe3'
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMTAzNGUyNC0yZjdjLTRkNzItYmZmZi0yZTY0MTJmNjhkODMiLCJlbWFpbCI6ImJoYXJhdGhrdW1hcmFjaGFyaXBzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MDE0MjBlZjg4ZDE0NGJiZDQxYyIsInNjb3BlZEtleVNlY3JldCI6IjE3Nzg3YzcxN2UzM2M2NTU1ZTIzNmU4YjVhNWYyYzZmOTNlZmZiOGVkNjg1OGY5MDUxYTRiZjhjMjIxNDJmZTMiLCJleHAiOjE3ODU1MjE3MTd9.ZM-VPs8f_FxJ7jzlt4tzoB3mduFkIz4EeHXFpkuheso'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export class SeatLayoutService {
  private static pinataApi = axios.create({
    baseURL: 'https://api.pinata.cloud',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json'
    }
  })

  private static backendApi = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    timeout: 10000
  })

  /**
   * Upload seat layout to IPFS via Pinata
   */
  static async uploadSeatLayoutToIPFS(seatLayout: TheaterSeatLayout): Promise<string> {
    try {
      console.log('📤 Uploading seat layout to IPFS:', seatLayout.theaterId)
      console.log('🔑 Pinata API Key:', PINATA_API_KEY ? 'Present' : 'Missing')
      console.log('🔑 Pinata JWT:', PINATA_JWT ? 'Present' : 'Missing')

      const metadata = {
        name: `Seat Layout - ${seatLayout.theaterName}`,
        description: `Seat layout configuration for ${seatLayout.theaterName}`,
        theaterId: seatLayout.theaterId,
        uploadedAt: new Date().toISOString()
      }

      const data = {
        pinataContent: {
          ...seatLayout,
          metadata
        },
        pinataMetadata: {
          name: `seat-layout-${seatLayout.theaterId}-${Date.now()}.json`,
          keyvalues: {
            theaterId: seatLayout.theaterId,
            type: 'seat-layout',
            version: '1.0'
          }
        }
      }

      const response = await this.pinataApi.post('/pinning/pinJSONToIPFS', data)
      
      if (response.data.IpfsHash) {
        console.log('✅ Seat layout uploaded to IPFS:', response.data.IpfsHash)
        return response.data.IpfsHash
      } else {
        throw new Error('Failed to get IPFS hash from Pinata response')
      }
    } catch (error) {
      console.error('❌ Error uploading seat layout to IPFS:', error)
      throw new Error('Failed to upload seat layout to IPFS')
    }
  }

  /**
   * Retrieve seat layout from IPFS
   */
  static async getSeatLayoutFromIPFS(ipfsHash: string): Promise<TheaterSeatLayout> {
    try {
      console.log('📥 Retrieving seat layout from IPFS:', ipfsHash)

      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      
      if (response.data) {
        console.log('✅ Seat layout retrieved from IPFS')
        return response.data
      } else {
        throw new Error('No data found in IPFS response')
      }
    } catch (error) {
      console.error('❌ Error retrieving seat layout from IPFS:', error)
      throw new Error('Failed to retrieve seat layout from IPFS')
    }
  }

  /**
   * Save seat layout configuration
   */
  static async saveSeatLayout(seatLayout: TheaterSeatLayout): Promise<{ success: boolean; ipfsHash: string }> {
    try {
      console.log('💾 Saving seat layout for theater:', seatLayout.theaterId)

      // Upload to IPFS first
      const ipfsHash = await this.uploadSeatLayoutToIPFS(seatLayout)

      // Save to backend with IPFS hash
      const response = await this.backendApi.post('/seat-layouts', {
        ...seatLayout,
        ipfsHash,
        lastUpdated: new Date().toISOString()
      })

      if (response.data.success) {
        console.log('✅ Seat layout saved successfully')
        return { success: true, ipfsHash }
      } else {
        throw new Error('Backend save failed')
      }
    } catch (error) {
      console.error('❌ Error saving seat layout:', error)
      throw new Error('Failed to save seat layout')
    }
  }

  /**
   * Get seat layout for a theater
   */
  static async getSeatLayout(theaterId: string): Promise<TheaterSeatLayout | null> {
    try {
      console.log('📋 Getting seat layout for theater:', theaterId)

      const response = await this.backendApi.get(`/seat-layouts/${theaterId}`)

      if (response.data.success && response.data.data) {
        const layoutData = response.data.data

        // If there's an IPFS hash, try to get the latest data from IPFS
        if (layoutData.ipfsHash) {
          try {
            const ipfsData = await this.getSeatLayoutFromIPFS(layoutData.ipfsHash)
            console.log('✅ Seat layout retrieved from IPFS')
            return ipfsData
          } catch (ipfsError) {
            console.warn('⚠️ Failed to retrieve from IPFS, using backend data')
            return layoutData
          }
        }

        return layoutData
      }

      return null
    } catch (error) {
      console.error('❌ Error getting seat layout:', error)
      return null
    }
  }

  /**
   * Get all theaters for an owner using the same method as Theater Management
   */
  static async getOwnerTheaters(ownerEmail: string): Promise<any[]> {
    try {
      console.log('🏛️ SeatLayoutService: Getting theaters for owner email:', ownerEmail)
      
      // Import the theater service to use the same blockchain method
      const { theaterService } = await import('../services/theaterService')
      
      // We need to get the user ID from the email, but for now let's try a different approach
      // Let's use the theater service's method but we need to find the user ID first
      
      // For now, let's try the API approach but with better error handling
      console.log('🔗 API Base URL:', `${API_BASE_URL}/admin`)
      console.log('📞 Full URL:', `${API_BASE_URL}/admin/theaters/owner/${encodeURIComponent(ownerEmail)}`)

      const response = await this.backendApi.get(`/theaters/owner/${encodeURIComponent(ownerEmail)}`)
      
      console.log('📋 API Response status:', response.status)
      console.log('📋 API Response data:', response.data)

      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} theaters`)
        return response.data.data
      } else {
        console.log('⚠️ API returned success: false')
        return []
      }
    } catch (error) {
      console.error('❌ Error getting owner theaters:', error)
      if (error.response) {
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response data:', error.response.data)
      }
      throw error // Re-throw to be caught by the component
    }
  }

  /**
   * Generate default seat layout for a screen
   */
  static generateDefaultSeatLayout(screenId: string, screenName: string, totalSeats: number): any {
    const rowsCount = Math.ceil(Math.sqrt(totalSeats))
    const seatsPerRow = Math.ceil(totalSeats / rowsCount)
    
    const layout = []
    let seatCounter = 1

    for (let row = 0; row < rowsCount; row++) {
      const rowLetter = String.fromCharCode(65 + row) // A, B, C, etc.
      const rowSeats = []

      for (let seat = 0; seat < seatsPerRow && seatCounter <= totalSeats; seat++) {
        rowSeats.push({
          id: `${screenId}-${rowLetter}${seat + 1}`,
          row: rowLetter,
          number: seat + 1,
          category: 'gold', // Default category
          isAvailable: true,
          isBlocked: false
        })
        seatCounter++
      }

      if (rowSeats.length > 0) {
        layout.push(rowSeats)
      }
    }

    return {
      screenId,
      screenName,
      screenPosition: 'center',
      totalSeats,
      categories: [
        { id: 'gold', name: 'Gold', color: '#EF4444', price: 150, totalSeats }
      ],
      seatMap: {
        rows: rowsCount,
        seatsPerRow,
        layout
      }
    }
  }
}