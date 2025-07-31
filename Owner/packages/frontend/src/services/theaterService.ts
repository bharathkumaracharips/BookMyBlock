import axios from 'axios'
import { TheaterFormData, Theater, TheaterStats } from '../types/theater'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api'

class TheaterService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/theaters`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  private setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Submit theater registration
  async submitTheaterApplication(data: TheaterFormData): Promise<Theater> {
    console.log('🎯 Theater service received data:', data)
    console.log('📄 PDF Hash:', data.pdfHash)
    console.log('🔗 IPFS URL:', data.ipfsUrls)
    
    try {
      // Submit to backend admin API
      const response = await fetch(`${API_BASE_URL}/admin/theater-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to submit theater application')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit theater application')
      }

      console.log('✅ Theater application submitted successfully:', result.data.id)
      
      // Convert backend response to Theater format
      const theater: Theater = {
        id: result.data.id,
        name: result.data.theaterName,
        location: `${result.data.city}, ${result.data.state}`,
        screens: result.data.numberOfScreens,
        totalSeats: result.data.totalSeats,
        status: result.data.status,
        createdAt: result.data.submittedAt,
        updatedAt: result.data.updatedAt,
        ownerName: result.data.ownerName,
        ownerEmail: result.data.ownerEmail,
        ownerPhone: result.data.ownerPhone,
        pdfHash: result.data.pdfHash,
        ipfsUrls: result.data.ipfsUrls
      }
      
      return theater
    } catch (error) {
      console.error('❌ Error submitting theater application:', error)
      throw error
    }
  }

  // Get owner's theaters
  async getOwnerTheaters(): Promise<Theater[]> {
    try {
      // For now, return empty array since we don't have owner-specific endpoint
      // In production, this would fetch from a proper owner endpoint
      return []
    } catch (error) {
      console.error('Error fetching owner theaters:', error)
      return []
    }
  }

  // Get application status by ID
  async getApplicationStatus(applicationId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/theater-requests/${applicationId}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch application status')
      }
      
      return result.data
    } catch (error) {
      console.error('Error fetching application status:', error)
      throw error
    }
  }

  // Get theater by ID
  async getTheaterById(id: string): Promise<Theater> {
    const response = await this.api.get(`/${id}`)
    return response.data
  }

  // Update theater
  async updateTheater(id: string, data: Partial<Theater>): Promise<Theater> {
    const response = await this.api.put(`/${id}`, data)
    return response.data
  }

  // Delete theater
  async deleteTheater(id: string): Promise<void> {
    await this.api.delete(`/${id}`)
  }

  // Get theater stats
  async getTheaterStats(): Promise<TheaterStats> {
    const response = await this.api.get('/stats')
    return response.data
  }

  // Upload additional documents
  async uploadDocument(theaterId: string, documentType: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', documentType)
    
    const response = await this.api.post(`/${theaterId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.url
  }

  // Get theater documents
  async getTheaterDocuments(theaterId: string): Promise<any[]> {
    const response = await this.api.get(`/${theaterId}/documents`)
    return response.data
  }
}

export const theaterService = new TheaterService()