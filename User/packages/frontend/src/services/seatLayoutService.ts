import axios from 'axios'
import { TheaterSeatLayout } from '../types/seatLayout'

// Use the same working Pinata configuration as the Owner app
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMTAzNGUyNC0yZjdjLTRkNzItYmZmZi0yZTY0MTJmNjhkODMiLCJlbWFpbCI6ImJoYXJhdGhrdW1hcmFjaGFyaXBzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MDE0MjBlZjg4ZDE0NGJiZDQxYyIsInNjb3BlZEtleVNlY3JldCI6IjE3Nzg3YzcxN2UzM2M2NTU1ZTIzNmU4YjVhNWYyYzZmOTNlZmZiOGVkNjg1OGY5MDUxYTRiZjhjMjIxNDJmZTMiLCJleHAiOjE3ODU1MjE3MTd9.ZM-VPs8f_FxJ7jzlt4tzoB3mduFkIz4EeHXFpkuheso'

const API_BASE_URL = 'http://localhost:8001/api' // User backend with seat layout endpoint

export class UserSeatLayoutService {
  private static backendApi = axios.create({
    baseURL: `${API_BASE_URL}/theaters`,
    timeout: 10000
  })

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
   * Get seat layout for a theater from backend (which may have IPFS hash)
   */
  static async getTheaterSeatLayout(theaterId: string): Promise<TheaterSeatLayout | null> {
    try {
      console.log('📋 Getting seat layout for theater:', theaterId)
      console.log('🔗 API URL:', `${API_BASE_URL}/theaters/${theaterId}/seat-layout`)

      // First try to get from backend
      const response = await this.backendApi.get(`/${theaterId}/seat-layout`)
      
      console.log('📋 Backend response status:', response.status)
      console.log('📋 Backend response data:', response.data)

      if (response.data.success && response.data.data) {
        const layoutData = response.data.data
        console.log('✅ Found seat layout data in backend:', layoutData)

        // If there's an IPFS hash, get the latest data from IPFS
        if (layoutData.ipfsHash) {
          console.log('🔗 Found IPFS hash:', layoutData.ipfsHash)
          try {
            const ipfsData = await this.getSeatLayoutFromIPFS(layoutData.ipfsHash)
            console.log('✅ Seat layout retrieved from IPFS:', ipfsData)
            console.log('📊 IPFS layout total seats:', ipfsData.screens[0]?.totalSeats)
            return ipfsData
          } catch (ipfsError) {
            console.warn('⚠️ Failed to retrieve from IPFS, using backend data:', ipfsError)
            return layoutData
          }
        }

        console.log('📋 Using backend data (no IPFS hash)')
        return layoutData
      }

      console.log('❌ No seat layout data found in backend response')
      return null
    } catch (error) {
      console.error('❌ Error getting theater seat layout:', error)
      if (error.response) {
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response data:', error.response.data)
      }
      return null
    }
  }

  /**
   * Generate default seat layout if none exists
   */
  static generateDefaultSeatLayout(theater: any): TheaterSeatLayout {
    console.log('📝 Generating default seat layout for theater:', theater.name)
    
    const screens = []
    const totalScreens = theater.screens || 1
    const seatsPerScreen = Math.floor((theater.totalSeats || 100) / totalScreens)

    for (let i = 1; i <= totalScreens; i++) {
      const rows = Math.ceil(seatsPerScreen / 15) // ~15 seats per row
      const seatsPerRow = Math.ceil(seatsPerScreen / rows)
      
      const seatMap = []
      let seatCounter = 1

      for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row) // A, B, C, etc.
        const rowSeats = []

        for (let seat = 0; seat < seatsPerRow && seatCounter <= seatsPerScreen; seat++) {
          // Determine seat category based on row position
          let category = 'gold'
          let price = 150

          if (row < 2) {
            category = 'recliner'
            price = 350
          } else if (row < 4) {
            category = 'vip'
            price = 250
          } else if (row < 6) {
            category = 'platinum'
            price = 200
          } else if (row < 8) {
            category = 'gold'
            price = 150
          } else {
            category = 'silver'
            price = 100
          }

          rowSeats.push({
            id: `${theater.id}-screen${i}-${rowLetter}${seat + 1}`,
            row: rowLetter,
            number: seat + 1,
            category,
            isAvailable: Math.random() > 0.15, // 85% seats available
            isBlocked: false
          })
          seatCounter++
        }

        if (rowSeats.length > 0) {
          seatMap.push(rowSeats)
        }
      }

      screens.push({
        screenId: `screen-${i}`,
        screenName: `Screen ${i}`,
        screenPosition: 'center' as const,
        totalSeats: seatsPerScreen,
        categories: [
          { id: 'recliner', name: 'Recliner', color: '#8B5CF6', price: 350, totalSeats: Math.floor(seatsPerScreen * 0.1) },
          { id: 'vip', name: 'VIP', color: '#F59E0B', price: 250, totalSeats: Math.floor(seatsPerScreen * 0.2) },
          { id: 'platinum', name: 'Platinum', color: '#10B981', price: 200, totalSeats: Math.floor(seatsPerScreen * 0.2) },
          { id: 'gold', name: 'Gold', color: '#EF4444', price: 150, totalSeats: Math.floor(seatsPerScreen * 0.3) },
          { id: 'silver', name: 'Silver', color: '#6B7280', price: 100, totalSeats: Math.floor(seatsPerScreen * 0.2) }
        ],
        seatMap: {
          rows,
          seatsPerRow,
          layout: seatMap
        }
      })
    }

    return {
      theaterId: theater.id,
      theaterName: theater.name,
      totalScreens,
      screens,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Get seat layout for theater - tries IPFS first, falls back to default
   */
  static async getSeatLayoutForBooking(theater: any): Promise<TheaterSeatLayout> {
    try {
      console.log('🎭 getSeatLayoutForBooking called for theater:', theater)
      console.log('🔍 Theater ID:', theater.id)
      console.log('🔍 Theater name:', theater.name)
      
      // Try to get real seat layout from IPFS
      const realLayout = await this.getTheaterSeatLayout(theater.id)
      
      if (realLayout) {
        console.log('✅ Using real seat layout from IPFS:', realLayout)
        console.log('📊 Real layout total seats:', realLayout.screens[0]?.totalSeats)
        return realLayout
      }
      
      // Fallback to generated layout
      console.log('📝 No real layout found, using generated default seat layout')
      console.log('🏗️ Theater data for default generation:', theater)
      const defaultLayout = this.generateDefaultSeatLayout(theater)
      console.log('📊 Generated layout total seats:', defaultLayout.screens[0]?.totalSeats)
      return defaultLayout
      
    } catch (error) {
      console.error('❌ Error getting seat layout, using default:', error)
      return this.generateDefaultSeatLayout(theater)
    }
  }
}