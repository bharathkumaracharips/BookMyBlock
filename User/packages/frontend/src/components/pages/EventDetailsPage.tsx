import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LocationService, Event, Theater } from '../../services/locationService'

export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingFlow, setShowBookingFlow] = useState(false)

  useEffect(() => {
    if (eventId) {
      loadEventDetails()
    }
  }, [eventId])

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll get the event from the theaters API
      // In a real app, you'd have a dedicated events API
      const allTheaters = await LocationService.searchTheaters('')
      
      let foundEvent: Event | null = null
      let eventTheaters: Theater[] = []

      // Find the event across all theaters
      for (const theater of allTheaters) {
        try {
          const theaterEvents = await LocationService.getEventsForTheater(theater.id)
          const matchingEvent = theaterEvents.find(e => e.id === eventId)
          
          if (matchingEvent) {
            foundEvent = matchingEvent
            eventTheaters.push(theater)
          }
        } catch (error) {
          console.warn(`Error fetching events for theater ${theater.id}:`, error)
        }
      }

      if (foundEvent) {
        setEvent(foundEvent)
        setTheaters(eventTheaters)
      } else {
        setError('Event not found')
      }

    } catch (err) {
      console.error('Error loading event details:', err)
      setError('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    setShowBookingFlow(true)
  }

  const handleTheaterSelect = (theater: Theater) => {
    setSelectedTheater(theater)
    setSelectedShowtime(null) // Reset showtime when theater changes
  }

  const handleShowtimeSelect = (showtime: string) => {
    setSelectedShowtime(showtime)
  }

  const handleBookTickets = () => {
    // TODO: Implement ticket booking logic
    alert(`Booking tickets for ${event?.title} at ${selectedTheater?.name} for ${selectedShowtime}`)
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    
    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
              <span className="text-slate-300">Loading event details...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{error || 'Event not found'}</h3>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Home</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
                  <p className="text-lg text-slate-300 mb-4">{event.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{event.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-violet-400 mb-1">₹{event.ticketPrice}</div>
                  <div className="text-sm text-slate-400">per ticket</div>
                </div>
              </div>

              {/* Trailer Section */}
              {event.imageUrl && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Movie Poster</h3>
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              {!showBookingFlow && (
                <button
                  onClick={handleBookNow}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Book Now
                </button>
              )}
            </div>

            {/* Booking Flow */}
            {showBookingFlow && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Book Your Tickets</h2>

                {/* Event Duration */}
                <div className="mb-8 p-4 bg-slate-700/50 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">Event Duration</h3>
                  <div className="flex items-center justify-between text-slate-300">
                    <div>
                      <span className="text-sm text-slate-400">Start Date:</span>
                      <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-slate-500">→</div>
                    <div>
                      <span className="text-sm text-slate-400">End Date:</span>
                      <div className="font-medium">{new Date(new Date(event.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Theater Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Theater</h3>
                  <div className="space-y-3">
                    {theaters.map((theater) => (
                      <div
                        key={theater.id}
                        onClick={() => handleTheaterSelect(theater)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedTheater?.id === theater.id
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{theater.name}</h4>
                            <p className="text-sm text-slate-400">{theater.location}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span>{theater.screens} screens</span>
                              <span>{theater.totalSeats} total seats</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedTheater?.id === theater.id
                              ? 'border-violet-500 bg-violet-500'
                              : 'border-slate-500'
                          }`}>
                            {selectedTheater?.id === theater.id && (
                              <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Showtime Selection */}
                {selectedTheater && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Select Showtime</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* For demo, we'll use the event time - in real app, get from theater's showtimes */}
                      {[event.time, '14:00', '18:00', '21:30'].map((time) => (
                        <button
                          key={time}
                          onClick={() => handleShowtimeSelect(time)}
                          className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                            selectedShowtime === time
                              ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                              : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-semibold">{time}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {event.availableSeats} seats left
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Tickets Button */}
                {selectedTheater && selectedShowtime && (
                  <button
                    onClick={handleBookTickets}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Book Tickets - ₹{event.ticketPrice} × 1 = ₹{event.ticketPrice}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Trailer */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-white mb-4">Watch Trailer</h3>
              
              {/* Trailer Embed */}
              <div className="relative rounded-xl overflow-hidden mb-6">
                <div className="aspect-video">
                  {event.trailerUrl ? (
                    <iframe
                      src={getYouTubeEmbedUrl(event.trailerUrl)}
                      title={`${event.title} Trailer`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : event.imageUrl ? (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center relative">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <p className="text-white">Trailer not available</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-400">Trailer not available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Available Seats</span>
                  <span className="text-white font-semibold">{event.availableSeats}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Total Seats</span>
                  <span className="text-white font-semibold">{event.totalSeats}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Status</span>
                  <span className="text-green-400 font-semibold capitalize">{event.status}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-semibold">{event.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}