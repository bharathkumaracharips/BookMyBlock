import { useState } from 'react'
import { useSimpleAuth } from '../../hooks/useSimpleAuth'
import { useTheater } from '../../hooks/useTheater'
import { SeatLayoutService } from '../../services/seatLayoutService'
import { TheaterSeatLayout } from '../../types/seatLayout'
import { SeatLayoutEditor } from '../ui/SeatLayoutEditor'
import { Theater } from '../../types/theater'

export function SeatLayoutManagement() {
  const { user, authenticated, ready } = useSimpleAuth()
  const { theaters, loading: theatersLoading, error: theatersError } = useTheater()
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [seatLayout, setSeatLayout] = useState<TheaterSeatLayout | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(theatersError)

  const selectTheater = async (theater: Theater) => {
    try {
      setSelectedTheater(theater)
      setError(null)

      console.log('🎭 Selected theater:', theater)

      // Try to load existing seat layout
      const existingLayout = await SeatLayoutService.getSeatLayout(theater.id)

      if (existingLayout) {
        console.log('✅ Found existing seat layout')
        setSeatLayout(existingLayout)
      } else {
        console.log('📝 Creating new seat layout')
        // Create default layout
        const defaultLayout: TheaterSeatLayout = {
          theaterId: theater.id,
          theaterName: theater.name || 'Unknown Theater',
          totalScreens: theater.screens || 1,
          screens: [],
          lastUpdated: new Date().toISOString()
        }

        // Generate default screens
        for (let i = 1; i <= (theater.screens || 1); i++) {
          const screenSeats = Math.floor((theater.totalSeats || 100) / (theater.screens || 1))
          const defaultScreen = SeatLayoutService.generateDefaultSeatLayout(
            `screen-${i}`,
            `Screen ${i}`,
            screenSeats
          )
          defaultLayout.screens.push(defaultScreen)
        }

        setSeatLayout(defaultLayout)
      }
    } catch (err) {
      console.error('❌ Error selecting theater:', err)
      setError('Failed to load theater seat layout')
    }
  }

  const saveSeatLayout = async (updatedLayout: TheaterSeatLayout) => {
    try {
      setSaving(true)
      setError(null)

      console.log('💾 Saving seat layout...')

      const result = await SeatLayoutService.saveSeatLayout(updatedLayout)

      if (result.success) {
        setSeatLayout({ ...updatedLayout, ipfsHash: result.ipfsHash })
        console.log('✅ Seat layout saved successfully')
        alert('Seat layout saved successfully!')
      }
    } catch (err) {
      console.error('❌ Error saving seat layout:', err)
      setError('Failed to save seat layout')
      alert('Failed to save seat layout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const goBack = () => {
    setSelectedTheater(null)
    setSeatLayout(null)
  }

  // Show loading while authentication is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-slate-300">Initializing...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-slate-400 mb-6">Please log in to access seat layout management</p>
            <a href="/" className="inline-flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              <span>Go to Login</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show seat layout editor if theater is selected
  if (selectedTheater && seatLayout) {
    return (
      <SeatLayoutEditor
        theater={selectedTheater}
        seatLayout={seatLayout}
        onSave={saveSeatLayout}
        onBack={goBack}
        saving={saving}
      />
    )
  }

  // Show loading while fetching theaters
  if (theatersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-slate-300">Loading theaters...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Seat Layout Management</h1>
          <p className="text-xl text-slate-300">Configure seat categories, pricing, and layouts for your theaters</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {theaters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No theaters found</h3>
            <p className="text-slate-400">You don't have any registered theaters yet. Please register a theater first.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <div
                key={theater.id}
                onClick={() => selectTheater(theater)}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                    {theater.screens || 1} screens
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors duration-200">
                  {theater.name || 'Unknown Theater'}
                </h3>
                <p className="text-sm text-slate-400 mb-3">{theater.location || 'Location not specified'}</p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{theater.totalSeats || 100} total seats</span>
                  <span className="text-violet-400">Configure →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}