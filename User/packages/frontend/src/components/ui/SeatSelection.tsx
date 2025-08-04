import { useState, useEffect } from 'react'
import { TheaterSeatLayout, ScreenLayout, SeatInfo } from '../../types/seatLayout'
import { UserSeatLayoutService } from '../../services/seatLayoutService'

interface SeatSelectionProps {
  theater: any
  event: any
  showtime: string
  onSeatSelect: (selectedSeats: SeatInfo[], totalPrice: number) => void
  onBack: () => void
}

export function SeatSelection({ theater, event, showtime, onSeatSelect, onBack }: SeatSelectionProps) {
  const [seatLayout, setSeatLayout] = useState<TheaterSeatLayout | null>(null)
  const [selectedScreen, setSelectedScreen] = useState<number>(0)
  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSeatLayout()
  }, [theater.id])

  const loadSeatLayout = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🎭 Loading seat layout for theater:', theater.name)
      
      // Get real seat layout from IPFS or generate default
      const layout = await UserSeatLayoutService.getSeatLayoutForBooking(theater)
      
      console.log('✅ Seat layout loaded:', layout)
      setSeatLayout(layout)
    } catch (err) {
      console.error('❌ Error loading seat layout:', err)
      setError('Failed to load seat layout')
    } finally {
      setLoading(false)
    }
  }



  const toggleSeatSelection = (seat: SeatInfo) => {
    if (!seat.isAvailable || seat.isBlocked) return

    const isSelected = selectedSeats.some(s => s.id === seat.id)
    
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
    } else {
      if (selectedSeats.length < 10) { // Max 10 seats
        setSelectedSeats(prev => [...prev, seat])
      }
    }
  }

  const getSeatPrice = (seat: SeatInfo) => {
    if (!seatLayout) return 0
    const screen = seatLayout.screens[selectedScreen]
    const category = screen.categories.find(cat => cat.id === seat.category)
    return category?.price || 0
  }

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0)
  }

  const handleProceedToBooking = () => {
    if (selectedSeats.length > 0) {
      onSeatSelect(selectedSeats, getTotalPrice())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-slate-300">Loading seat layout...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !seatLayout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Seats</h3>
            <p className="text-slate-400 mb-6">{error || 'Failed to load seat layout'}</p>
            <button
              onClick={onBack}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentScreen = seatLayout.screens[selectedScreen]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <p className="text-slate-400">{theater.name} • {showtime}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              {/* Screen Selection */}
              {seatLayout.screens.length > 1 && (
                <div className="mb-6">
                  <div className="flex space-x-2">
                    {seatLayout.screens.map((screen, index) => (
                      <button
                        key={screen.screenId}
                        onClick={() => setSelectedScreen(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          selectedScreen === index
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {screen.screenName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Screen Indicator */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-slate-600 to-slate-500 text-white px-12 py-3 rounded-xl text-sm font-medium shadow-lg">
                  🎬 SCREEN - {currentScreen.screenName}
                </div>
                <p className="text-xs text-slate-400 mt-2">All eyes this way please!</p>
              </div>

              {/* Seat Map */}
              <div className="space-y-3 max-w-5xl mx-auto">
                {currentScreen.seatMap.layout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-center space-x-2">
                    {/* Row Label */}
                    <div className="w-10 text-center text-slate-300 text-sm font-bold bg-slate-700/50 rounded-lg py-2">
                      {row[0]?.row}
                    </div>
                    
                    {/* Left Aisle */}
                    <div className="w-4"></div>
                    
                    {/* Seats */}
                    <div className="flex space-x-1">
                      {row.map((seat, seatIndex) => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id)
                        const category = currentScreen.categories.find(cat => cat.id === seat.category)
                        
                        // Add aisle space in the middle
                        const showAisle = seatIndex === Math.floor(row.length / 2)
                        
                        return (
                          <div key={seat.id} className="flex items-center">
                            {showAisle && <div className="w-6"></div>}
                            <button
                              onClick={() => toggleSeatSelection(seat)}
                              disabled={!seat.isAvailable || seat.isBlocked}
                              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 border-2 ${
                                !seat.isAvailable || seat.isBlocked
                                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-600'
                                  : isSelected
                                  ? 'bg-green-500 text-white scale-110 shadow-lg border-green-400 animate-pulse'
                                  : `hover:scale-105 text-white border-transparent hover:border-white/30`
                              }`}
                              style={{
                                backgroundColor: !seat.isAvailable || seat.isBlocked 
                                  ? undefined 
                                  : isSelected 
                                  ? undefined 
                                  : category?.color
                              }}
                              title={`${seat.row}${seat.number} - ${category?.name} - ₹${category?.price}${!seat.isAvailable ? ' (Unavailable)' : ''}`}
                            >
                              {isSelected ? '✓' : seat.number}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Right Aisle */}
                    <div className="w-4"></div>
                    
                    {/* Row Label (Right) */}
                    <div className="w-10 text-center text-slate-300 text-sm font-bold bg-slate-700/50 rounded-lg py-2">
                      {row[0]?.row}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-10 bg-slate-700/30 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-white mb-4 text-center">Seat Categories & Pricing</h4>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {currentScreen.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-lg">
                      <div
                        className="w-6 h-6 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <span className="text-sm font-medium text-white">{category.name}</span>
                        <div className="text-xs text-slate-300">₹{category.price}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center space-x-3 bg-green-500/20 px-4 py-2 rounded-lg">
                    <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-green-300">Selected</span>
                      <div className="text-xs text-green-400">Your choice</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-lg">
                    <div className="w-6 h-6 rounded-lg bg-slate-700 border-2 border-slate-600"></div>
                    <div>
                      <span className="text-sm font-medium text-slate-400">Unavailable</span>
                      <div className="text-xs text-slate-500">Already booked</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600 rounded-2xl p-6 sticky top-24 shadow-2xl">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Booking Summary</h3>
              </div>

              {/* Movie & Theater Info */}
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-white text-sm mb-2">{event.title}</h4>
                <p className="text-slate-300 text-xs mb-1">{theater.name}</p>
                <p className="text-slate-400 text-xs">{showtime} • {currentScreen.screenName}</p>
              </div>
              
              {selectedSeats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">Select seats to continue</p>
                  <p className="text-slate-500 text-xs mt-1">Choose up to 10 seats</p>
                </div>
              ) : (
                <>
                  {/* Selected Seats */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Selected Seats</h4>
                    {selectedSeats.map((seat) => {
                      const category = currentScreen.categories.find(cat => cat.id === seat.category)
                      return (
                        <div key={seat.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: category?.color }}
                            ></div>
                            <div>
                              <span className="text-white font-medium text-sm">{seat.row}{seat.number}</span>
                              <p className="text-slate-400 text-xs">{category?.name}</p>
                            </div>
                          </div>
                          <span className="text-green-400 font-semibold">₹{category?.price}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Total */}
                  <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-semibold">Total Amount</span>
                        <p className="text-slate-300 text-xs">
                          {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-400">₹{getTotalPrice()}</span>
                        <p className="text-slate-400 text-xs">Inclusive of taxes</p>
                      </div>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <button
                    onClick={handleProceedToBooking}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Proceed to Payment</span>
                    </div>
                  </button>

                  <p className="text-center text-xs text-slate-500 mt-3">
                    Secure payment powered by blockchain
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}