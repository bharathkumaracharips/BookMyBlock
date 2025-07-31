import axios from 'axios'
import { Event, CreateEventData, EventStats } from '../types/event'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api'

class EventService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/events`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  private setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Create a new event
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      console.log('🎬 Creating event:', eventData)
      
      const response = await this.api.post('/', eventData)
      
      if (response.data.success) {
        console.log('✅ Event created successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('❌ Error creating event:', error)
      throw error
    }
  }

  // Get events for a specific theater
  async getTheaterEvents(theaterId: string): Promise<Event[]> {
    try {
      console.log('📡 Fetching events for theater:', theaterId)
      
      const response = await this.api.get(`/theater/${theaterId}`)
      
      if (response.data.success) {
        console.log('✅ Events fetched successfully:', response.data.data.length)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch events')
      }
    } catch (error) {
      console.error('❌ Error fetching theater events:', error)
      // Return empty array for now - in production you might want to throw
      return []
    }
  }

  // Get all events for the current user
  async getUserEvents(userId?: string): Promise<Event[]> {
    try {
      console.log('📡 Fetching user events for:', userId)
      
      const response = await this.api.get('/user', {
        params: userId ? { userId } : {}
      })
      
      if (response.data.success) {
        console.log('✅ User events fetched successfully:', response.data.data.length)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch user events')
      }
    } catch (error) {
      console.error('❌ Error fetching user events:', error)
      return []
    }
  }

  // Update an event
  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<Event> {
    try {
      console.log('📝 Updating event:', eventId, eventData)
      
      const response = await this.api.put(`/${eventId}`, eventData)
      
      if (response.data.success) {
        console.log('✅ Event updated successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('❌ Error updating event:', error)
      throw error
    }
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting event:', eventId)
      
      const response = await this.api.delete(`/${eventId}`)
      
      if (response.data.success) {
        console.log('✅ Event deleted successfully')
      } else {
        throw new Error(response.data.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('❌ Error deleting event:', error)
      throw error
    }
  }

  // Get event statistics
  async getEventStats(userId?: string): Promise<EventStats> {
    try {
      console.log('📊 Fetching event stats for user:', userId)
      
      const response = await this.api.get('/stats', {
        params: userId ? { userId } : {}
      })
      
      if (response.data.success) {
        console.log('✅ Event stats fetched successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch event stats')
      }
    } catch (error) {
      console.error('❌ Error fetching event stats:', error)
      // Return default stats
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        ongoingEvents: 0,
        completedEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0
      }
    }
  }

  // Get event by ID
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      console.log('🔍 Fetching event by ID:', eventId)
      
      const response = await this.api.get(`/${eventId}`)
      
      if (response.data.success) {
        console.log('✅ Event fetched successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch event')
      }
    } catch (error) {
      console.error('❌ Error fetching event by ID:', error)
      return null
    }
  }

  // Cancel an event
  async cancelEvent(eventId: string, reason?: string): Promise<Event> {
    try {
      console.log('❌ Cancelling event:', eventId, 'Reason:', reason)
      
      const response = await this.api.patch(`/${eventId}/cancel`, { reason })
      
      if (response.data.success) {
        console.log('✅ Event cancelled successfully:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to cancel event')
      }
    } catch (error) {
      console.error('❌ Error cancelling event:', error)
      throw error
    }
  }
}

export const eventService = new EventService()