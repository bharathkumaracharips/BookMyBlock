import { useState, useEffect } from 'react'
import { Theater, TheaterFormData, TheaterStats } from '../types/theater'
import { theaterService } from '../services/theaterService'
import { useSimpleAuth } from './useSimpleAuth'

export function useTheater() {
  const { user } = useSimpleAuth()
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [stats, setStats] = useState<TheaterStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load theaters when user changes
  useEffect(() => {
    if (user?.id) {
      loadTheaters()
      loadStats()
    }
  }, [user?.id])

  // Load theaters
  const loadTheaters = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Pass user ID to fetch theaters from blockchain
      const userId = user?.id
      console.log('🔍 Loading theaters for user:', userId)
      
      const data = await theaterService.getOwnerTheaters(userId)
      setTheaters(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theaters')
    } finally {
      setLoading(false)
    }
  }

  // Load stats
  const loadStats = async () => {
    try {
      const data = await theaterService.getTheaterStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Submit theater application
  const submitTheater = async (data: TheaterFormData): Promise<Theater | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // Pass the user ID to the theater service for blockchain submission
      const userId = user?.id
      console.log('🔑 User ID for blockchain submission:', userId)
      console.log('🔑 Full user:', user)
      
      if (!userId) {
        console.error('❌ No user ID available from user object')
        throw new Error('User must be authenticated to submit theater application')
      }
      
      const newTheater = await theaterService.submitTheaterApplication(data, userId)
      setTheaters(prev => [...prev, newTheater])
      await loadStats() // Refresh stats
      return newTheater
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit theater application')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update theater
  const updateTheater = async (id: string, data: Partial<Theater>): Promise<Theater | null> => {
    try {
      setLoading(true)
      setError(null)
      const updatedTheater = await theaterService.updateTheater(id, data)
      setTheaters(prev => prev.map(t => t.id === id ? updatedTheater : t))
      return updatedTheater
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theater')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete theater
  const deleteTheater = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await theaterService.deleteTheater(id)
      setTheaters(prev => prev.filter(t => t.id !== id))
      await loadStats() // Refresh stats
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete theater')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Upload document
  const uploadDocument = async (theaterId: string, documentType: string, file: File): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)
      const url = await theaterService.uploadDocument(theaterId, documentType, file)
      return url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    loadTheaters()
    loadStats()
  }, [])

  return {
    theaters,
    stats,
    loading,
    error,
    submitTheater,
    updateTheater,
    deleteTheater,
    uploadDocument,
    loadTheaters,
    loadStats,
  }
}