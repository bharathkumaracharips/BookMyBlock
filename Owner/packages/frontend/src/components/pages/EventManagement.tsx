import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Film, Plus, ArrowLeft, Home, ExternalLink, Users } from 'lucide-react'
import { theaterService } from '../../services/theaterService'
import { eventService } from '../../services/eventService'
import { ipfsEventService } from '../../services/ipfsEventService'
import { Theater } from '../../types/theater'
import { Event, CreateEventData } from '../../types/event'
import { usePrivy, User } from '@privy-io/react-auth'

interface EventManagementProps {
  onBackToDashboard?: () => void
}

export function EventManagement({ onBackToDashboard }: EventManagementProps) {
  const { user } = usePrivy()
  const [approvedTheaters, setApprovedTheaters] = useState<Theater[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'monitor'>('create')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApprovedTheaters()
  }, [user])

  // Load events after theaters are loaded
  useEffect(() => {
    if (approvedTheaters.length > 0) {
      loadAllEvents()
    }
  }, [approvedTheaters])

  const loadApprovedTheaters = async () => {
    try {
      setLoading(true)
      const theaters = await theaterService.getOwnerTheaters(user?.id)
      // Filter only approved theaters
      const approved = theaters.filter(theater => theater.status === 'active')
      setApprovedTheaters(approved)
    } catch (error) {
      console.error('Error loading approved theaters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTheaterSelect = (theater: Theater) => {
    setSelectedTheater(theater)
    // Load events for this theater
    loadTheaterEvents(theater.id)
  }

  const loadAllEvents = async () => {
    try {
      console.log('📡 Loading all user events...')
      const userEvents = await eventService.getUserEvents(user?.id)

      // Wait for theaters to be loaded first
      if (approvedTheaters.length === 0) {
        // If theaters aren't loaded yet, just set events without enrichment
        setAllEvents(userEvents.map(event => ({
          ...event,
          theaterName: event.theaterName || 'Loading...',
          theaterLocation: 'Loading...'
        })))
        return
      }

      // Enrich events with theater information
      const enrichedEvents = userEvents.map(event => {
        const theater = approvedTheaters.find(t => t.id === event.theaterId)
        return {
          ...event,
          theaterName: theater?.name || event.theaterName || 'Unknown Theater',
          theaterLocation: theater?.location || 'Unknown Location'
        }
      })

      setAllEvents(enrichedEvents)
    } catch (error) {
      console.error('Error loading all events:', error)
      setAllEvents([])
    }
  }

  const loadTheaterEvents = async (theaterId: string) => {
    try {
      console.log('📡 Loading events for theater:', theaterId)
      const theaterEvents = await eventService.getTheaterEvents(theaterId)
      setEvents(theaterEvents)
    } catch (error) {
      console.error('Error loading theater events:', error)
      // For now, show empty state - in production you might want to show an error message
      setEvents([])
    }
  }

  const handleCreateEvent = () => {
    setShowCreateForm(true)
  }

  const handleBackToTheaters = () => {
    setSelectedTheater(null)
    setShowCreateForm(false)
    setEvents([])
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleBackToMonitoring = () => {
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your approved theaters...</p>
        </div>
      </div>
    )
  }

  if (approvedTheaters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center max-w-md mx-auto p-6">
          <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Approved Theaters</h2>
          <p className="text-gray-600 mb-6">
            You need to have at least one approved theater to manage events and showtimes.
          </p>
          <button
            onClick={onBackToDashboard || (() => window.history.back())}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    )
  }

  if (showCreateForm && selectedTheater) {
    return (
      <CreateEventForm
        theater={selectedTheater}
        user={user}
        onBack={() => setShowCreateForm(false)}
        onEventCreated={() => {
          loadTheaterEvents(selectedTheater.id)
          loadAllEvents()
        }}
      />
    )
  }

  if (selectedEvent) {
    return <EventDetailsView event={selectedEvent} onBack={handleBackToMonitoring} />
  }

  if (selectedTheater) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToTheaters}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedTheater.name}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedTheater.location}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Scheduled</h3>
                <p className="text-gray-600 mb-4">Create your first event to start selling tickets.</p>
                <button
                  onClick={handleCreateEvent}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{event.movieTitle}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </div>
                            <div>₹{event.ticketPrice} per ticket</div>
                            <div>{event.availableSeats}/{event.totalSeats} seats available</div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Show times:</span>
                            <div className="flex flex-wrap gap-1">
                              {event.showTimes?.map((time, index) => (
                                <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {time}
                                </span>
                              )) || (
                                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {event.showTime || 'No times set'}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {event.ipfsHash && (
                          <a
                            href={event.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${event.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-xs font-medium bg-purple-50 px-2 py-1 rounded-full"
                            title="View on IPFS"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>IPFS</span>
                          </a>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main Event Management View with Tabs
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-gray-600">Create and monitor your theater events and showtimes</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Events</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('monitor')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'monitor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Film className="h-4 w-4" />
                  <span>Monitor Events</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'create' ? (
              <CreateEventsTab
                approvedTheaters={approvedTheaters}
                onTheaterSelect={handleTheaterSelect}
              />
            ) : (
              <MonitorEventsTab
                events={allEvents}
                onEventClick={handleEventClick}
                onRefresh={loadAllEvents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Event Form Component
function CreateEventForm({ theater, user, onBack, onEventCreated }: {
  theater: Theater;
  user: User | null;
  onBack: () => void;
  onEventCreated?: () => void;
}) {
  const [formData, setFormData] = useState({
    movieTitle: '',
    startDate: '',
    endDate: '',
    ticketPrice: '',
    description: '',
    trailerUrl: ''
  })
  const [showTimes, setShowTimes] = useState<string[]>([''])
  const [posterImage, setPosterImage] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addShowTime = () => {
    setShowTimes([...showTimes, ''])
  }

  const removeShowTime = (index: number) => {
    if (showTimes.length > 1) {
      setShowTimes(showTimes.filter((_, i) => i !== index))
    }
  }

  const updateShowTime = (index: number, value: string) => {
    const newShowTimes = [...showTimes]
    newShowTimes[index] = value
    setShowTimes(newShowTimes)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setPosterImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePosterImage = () => {
    setPosterImage(null)
    setPosterPreview(null)
  }

  // YouTube URL validation and processing
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleTrailerUrlChange = (url: string) => {
    setFormData({ ...formData, trailerUrl: url })

    if (url.trim()) {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        setTrailerPreview(`https://www.youtube.com/embed/${videoId}`)
      } else {
        setTrailerPreview(null)
      }
    } else {
      setTrailerPreview(null)
    }
  }

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty is valid (optional field)
    return extractYouTubeVideoId(url) !== null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)

      if (endDate < startDate) {
        alert('❌ End date must be after start date')
        setIsSubmitting(false)
        return
      }

      // Filter out empty show times
      const validShowTimes = showTimes.filter(time => time.trim() !== '')

      if (validShowTimes.length === 0) {
        alert('❌ Please add at least one show time')
        setIsSubmitting(false)
        return
      }

      // Validate trailer URL if provided
      if (formData.trailerUrl && !isValidYouTubeUrl(formData.trailerUrl)) {
        alert('❌ Please enter a valid YouTube URL')
        setIsSubmitting(false)
        return
      }

      const eventData: CreateEventData = {
        theaterId: theater.id,
        movieTitle: formData.movieTitle,
        startDate: formData.startDate,
        endDate: formData.endDate,
        showTimes: validShowTimes,
        ticketPrice: parseInt(formData.ticketPrice),
        description: formData.description || undefined,
        trailerUrl: formData.trailerUrl || undefined
      }

      console.log('🎬 Creating event:', eventData)

      // Step 1: Upload poster image to IPFS (if provided)
      let posterHash: string | undefined
      if (posterImage) {
        console.log('📤 Uploading poster image to IPFS...')
        posterHash = await ipfsEventService.uploadImageToIPFS(posterImage)
        console.log('✅ Poster uploaded to IPFS:', posterHash)
      }

      // Step 2: Upload event data to IPFS
      console.log('📤 Uploading event to IPFS...')
      const ipfsHash = await ipfsEventService.uploadEventToIPFS(
        eventData,
        theater.name,
        user?.id || 'unknown',
        posterHash
      )

      console.log('✅ Event uploaded to IPFS:', ipfsHash)

      // Step 3: Create event in backend with IPFS hash
      const eventWithIPFS = {
        ...eventData,
        ipfsHash,
        ipfsUrl: ipfsEventService.getEventIPFSUrl(ipfsHash),
        posterHash,
        posterUrl: posterHash ? ipfsEventService.getEventIPFSUrl(posterHash) : undefined
      }

      await eventService.createEvent(eventWithIPFS)

      const successMessage = `✅ Event created successfully!\n\n📄 Event IPFS Hash: ${ipfsHash}\n🔗 View Event on IPFS: ${ipfsEventService.getEventIPFSUrl(ipfsHash)}${posterHash ? `\n\n🖼️ Poster IPFS Hash: ${posterHash}\n🔗 View Poster on IPFS: ${ipfsEventService.getEventIPFSUrl(posterHash)}` : ''}${eventData.trailerUrl ? `\n\n🎬 Trailer URL: ${eventData.trailerUrl}` : ''}\n\nYour event data${posterHash ? ', poster' : ''}${eventData.trailerUrl ? ', and trailer link' : ''} ${posterHash || eventData.trailerUrl ? 'are' : 'is'} now stored on IPFS for decentralized access.`

      alert(successMessage)
      onEventCreated?.()
      onBack()
    } catch (error) {
      console.error('❌ Error creating event:', error)
      alert('❌ Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">{theater.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movie Title
              </label>
              <input
                type="text"
                required
                value={formData.movieTitle}
                onChange={(e) => setFormData({ ...formData, movieTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter movie title"
              />
            </div>

            {/* Movie Poster Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movie Poster (Optional)
              </label>
              <div className="space-y-4">
                {!posterPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="poster-upload"
                    />
                    <label
                      htmlFor="poster-upload"
                      className="cursor-pointer flex flex-col items-center space-y-3"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-blue-600 font-semibold text-lg group-hover:text-blue-700">Upload Movie Poster</span>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        <p className="text-xs text-gray-400 mt-1">Recommended: 300x450px (2:3 aspect ratio)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="relative group">
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg"></div>
                        <button
                          type="button"
                          onClick={removePosterImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove poster"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-green-700">Poster ready for upload</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {posterImage && `${(posterImage.size / 1024 / 1024).toFixed(1)}MB`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a poster image for your movie/event. This will be stored on IPFS for decentralized access.
              </p>
            </div>

            {/* Movie Trailer URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movie Trailer (Optional)
              </label>
              <div className="space-y-4">
                <div>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => handleTrailerUrlChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.trailerUrl && !isValidYouTubeUrl(formData.trailerUrl)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                      }`}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {formData.trailerUrl && !isValidYouTubeUrl(formData.trailerUrl) && (
                    <p className="text-red-600 text-xs mt-1">Please enter a valid YouTube URL</p>
                  )}
                </div>

                {/* Trailer Preview */}
                {trailerPreview && (
                  <div className="relative">
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={trailerPreview}
                          title="Movie Trailer Preview"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Trailer preview ready</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTrailerUrlChange('')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add a YouTube trailer URL to showcase your movie. Supports youtube.com and youtu.be links.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]} // End date must be after start date
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Show Times
                </label>
                <button
                  type="button"
                  onClick={addShowTime}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Show Time</span>
                </button>
              </div>
              <div className="space-y-2">
                {showTimes.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => updateShowTime(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {showTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeShowTime(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add multiple show times for this movie (e.g., 10:00 AM, 2:00 PM, 6:00 PM, 9:00 PM)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price (₹)
              </label>
              <input
                type="number"
                required
                min="50"
                max="1000"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ticket price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event description"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Create Events Tab Component
function CreateEventsTab({ approvedTheaters, onTheaterSelect }: {
  approvedTheaters: Theater[];
  onTheaterSelect: (theater: Theater) => void;
}) {
  if (approvedTheaters.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Theaters</h3>
        <p className="text-gray-600">
          You need to have at least one approved theater to create events.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Theater</h2>
        <p className="text-gray-600">Choose a theater to create events and showtimes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedTheaters.map((theater) => (
          <div
            key={theater.id}
            onClick={() => onTheaterSelect(theater)}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{theater.name}</h3>
                <p className="text-gray-600 flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {theater.location}
                </p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Approved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Screens:</span> {theater.screens}
              </div>
              <div>
                <span className="font-medium">Seats:</span> {theater.totalSeats}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Click to create events
                </span>
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Monitor Events Tab Component
function MonitorEventsTab({ events, onEventClick, onRefresh }: {
  events: Event[];
  onEventClick: (event: Event) => void;
  onRefresh: () => void;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
        <p className="text-gray-600 mb-4">
          You haven't created any events yet. Switch to the Create Events tab to get started.
        </p>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Events
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Monitoring</h2>
          <p className="text-gray-600">Monitor all your events across theaters</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={async () => {
              try {
                console.log('🔄 Refreshing events from IPFS...')
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/refresh-from-ipfs`, {
                  method: 'POST'
                })
                const result = await response.json()
                if (result.success) {
                  alert(`✅ Successfully reloaded ${result.data.eventsLoaded} events from IPFS!`)
                  onRefresh()
                } else {
                  alert('❌ Failed to refresh events from IPFS')
                }
              } catch (error) {
                console.error('Error refreshing from IPFS:', error)
                alert('❌ Error refreshing events from IPFS')
              }
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            title="Reload events from IPFS storage"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Sync IPFS</span>
          </button>
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing backend connection...')
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/test`)
                const result = await response.json()
                console.log('Backend test result:', result)
                alert(`Backend Status:\n✅ Connected: ${result.success}\n📊 Events in memory: ${result.eventsInMemory}\n🔄 Initialized: ${result.isInitialized}`)
              } catch (error) {
                console.error('Error testing backend:', error)
                alert('❌ Backend connection failed!')
              }
            }}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Test backend connection"
          >
            🧪
          </button>
          <button
            onClick={async () => {
              try {
                console.log('🔍 Debugging IPFS...')
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/debug-ipfs`)
                const result = await response.json()
                console.log('Debug result:', result)
                alert(`Debug Info:\nTotal IPFS pins: ${result.totalPins}\nCurrent events: ${result.currentEvents}\nCheck console for details`)
              } catch (error) {
                console.error('Error debugging IPFS:', error)
                alert('❌ Error debugging IPFS')
              }
            }}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Debug IPFS content"
          >
            🔍
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            {/* Poster Image */}
            <div className="mb-4 relative overflow-hidden rounded-lg">
              {event.posterUrl ? (
                <>
                  <img
                    src={event.posterUrl}
                    alt={`${event.movieTitle} poster`}
                    className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      Movie Poster
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Film className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500 font-medium">{event.movieTitle}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.movieTitle}</h3>
                <p className="text-sm font-medium text-blue-600 mb-2">{event.theaterName}</p>
                <p className="text-gray-600 flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.theaterLocation || 'Location not available'}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {event.ipfsHash && (
                  <a
                    href={event.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${event.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-xs font-medium bg-purple-50 px-2 py-1 rounded-full"
                    title="View on IPFS"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>IPFS</span>
                  </a>
                )}
                {event.trailerUrl && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded-full">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Trailer</span>
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{event.showTimes?.length || 0} show times</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">₹{event.ticketPrice}</span>
                <span className="mx-2">•</span>
                <span>{event.availableSeats}/{event.totalSeats} seats</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Click to view details
                </span>
                <div className="text-blue-600">
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Event Details View Component
function EventDetailsView({ event, onBack }: {
  event: Event;
  onBack: () => void;
}) {
  // Extract YouTube video ID for embedding
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return `https://www.youtube.com/embed/${match[1]}`
    }
    return null
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{event.movieTitle}</h1>
              <p className="text-gray-600">{event.theaterName} • {event.theaterLocation}</p>
            </div>
            {event.ipfsHash && (
              <a
                href={event.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${event.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-3 py-2 rounded-lg"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on IPFS</span>
              </a>
            )}
          </div>

          {/* Movie Poster and Trailer */}
          {(event.posterUrl || event.trailerUrl) && (
            <div className="mb-8">
              <div className={`grid gap-6 ${event.posterUrl && event.trailerUrl ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} justify-items-center`}>

                {/* Movie Poster */}
                {event.posterUrl && (
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={event.posterUrl}
                        alt={`${event.movieTitle} poster`}
                        className="w-80 h-[450px] object-cover rounded-xl shadow-2xl border border-gray-200 group-hover:shadow-3xl transition-all duration-300"
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={event.posterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
                          title="View full size"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                          Movie Poster
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Movie Trailer */}
                {event.trailerUrl && getYouTubeEmbedUrl(event.trailerUrl) && (
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className="w-80 h-[450px] rounded-xl overflow-hidden shadow-2xl border border-gray-200 group-hover:shadow-3xl transition-all duration-300">
                        <iframe
                          src={getYouTubeEmbedUrl(event.trailerUrl)!}
                          title={`${event.movieTitle} Trailer`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span>Movie Trailer</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-gray-600">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="h-5 w-5 text-gray-400 flex items-center justify-center font-bold">₹</span>
                  <div>
                    <p className="font-medium text-gray-900">Ticket Price</p>
                    <p className="text-gray-600">₹{event.ticketPrice} per ticket</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Seating</p>
                    <p className="text-gray-600">{event.availableSeats} available of {event.totalSeats} total seats</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`h-3 w-3 rounded-full ${event.status === 'upcoming' ? 'bg-blue-500' :
                    event.status === 'ongoing' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></span>
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <p className="text-gray-600 capitalize">{event.status}</p>
                  </div>
                </div>

                {event.description && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Description</p>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Show Times */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Show Times</h2>
              <div className="grid grid-cols-2 gap-3">
                {event.showTimes?.map((time, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{time}</span>
                    </div>
                  </div>
                )) || (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No show times available
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Edit Event
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Cancel Event
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}