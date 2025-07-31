export interface Event {
  id: string
  theaterId: string
  theaterName: string
  movieTitle: string
  startDate: string
  endDate: string
  showTimes: string[]
  ticketPrice: number
  availableSeats: number
  totalSeats: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  description?: string
  ipfsHash?: string
  ipfsUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  theaterId: string
  movieTitle: string
  startDate: string
  endDate: string
  showTimes: string[]
  ticketPrice: number
  description?: string
  ipfsHash?: string
  ipfsUrl?: string
}

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  ongoingEvents: number
  completedEvents: number
  totalRevenue: number
  totalTicketsSold: number
}