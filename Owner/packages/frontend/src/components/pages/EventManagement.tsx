import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Film, Plus, ArrowLeft, Home } from 'lucide-react'
import { theaterService } from '../../services/theaterService'
import { eventService } from '../../services/eventService'
import { Theater } from '../../types/theater'
import { Event, CreateEventData } from '../../types/event'
import { usePrivy } from '@privy-io/react-auth'

interface EventManagementProps {
  onBackToDashboard?: () => void
}

export function EventManagement({ onBackToDashboard }: EventManagementProps) {
  const { user } = usePrivy()
  const [approvedTheaters, setApprovedTheaters] = useState<Theater[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApprovedTheaters()
  }, [user])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your approved theaters...</p>
        </div>
      </div>
    )
  }

  if (approvedTheaters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        onBack={() => setShowCreateForm(false)}
        onEventCreated={() => loadTheaterEvents(selectedTheater.id)}
      />
    )
  }

  if (selectedTheater) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(event.showDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.showTime}
                          </div>
                          <div>₹{event.ticketPrice} per ticket</div>
                          <div>{event.availableSeats}/{event.totalSeats} seats available</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
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

  // Theater Selection View
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
          <p className="text-gray-600">Select a theater to manage events and showtimes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedTheaters.map((theater) => (
            <div
              key={theater.id}
              onClick={() => handleTheaterSelect(theater)}
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
                    Click to manage events
                  </span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <Film className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Create Event Form Component
function CreateEventForm({ theater, onBack, onEventCreated }: { 
  theater: Theater; 
  onBack: () => void;
  onEventCreated?: () => void;
}) {
  const [formData, setFormData] = useState({
    movieTitle: '',
    showDate: '',
    showTime: '',
    ticketPrice: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const eventData: CreateEventData = {
        theaterId: theater.id,
        movieTitle: formData.movieTitle,
        showDate: formData.showDate,
        showTime: formData.showTime,
        ticketPrice: parseInt(formData.ticketPrice),
        description: formData.description || undefined
      }

      console.log('🎬 Creating event:', eventData)
      await eventService.createEvent(eventData)
      
      alert('✅ Event created successfully!')
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
    <div className="min-h-screen bg-gray-50 p-6">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  value={formData.showDate}
                  onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.showTime}
                  onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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