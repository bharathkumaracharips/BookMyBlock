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
    const formData = new FormData()
    
    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        formData.append(key, value)
      } else if (value && typeof value === 'number') {
        formData.append(key, value.toString())
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      }
    })
    
    // Add file uploads
    const fileFields = [
      'ownerPanCard',
      'ownerAadharFront', 
      'ownerAadharBack',
      'cinemaLicense',
      'fireNoc',
      'buildingPermission',
      'tradeLicense',
      'insurancePolicy'
    ]
    
    fileFields.forEach(field => {
      const files = data[field as keyof TheaterFormData] as FileList
      if (files && files.length > 0) {
        formData.append(field, files[0])
      }
    })

    const response = await this.api.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  // Get owner's theaters
  async getOwnerTheaters(): Promise<Theater[]> {
    const response = await this.api.get('/owner')
    return response.data
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