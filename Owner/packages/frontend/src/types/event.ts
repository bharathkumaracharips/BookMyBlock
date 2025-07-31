export interface Event {
  id: string
  theaterId: string
  theaterName: string
  movieTitle: string
  showDate: string
  showTime: string
  ticketPrice: number
  availableSeats: number
  totalSeats: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  theaterId: string
  movieTitle: string
  showDate: string
  showTime: string
  ticketPrice: number
  description?: string
}

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  ongoingEvents: number
  completedEvents: number
  totalRevenue: number
  totalTicketsSold: number
}