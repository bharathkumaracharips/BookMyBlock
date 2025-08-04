export interface SeatCategory {
  id: string
  name: string
  color: string
  price: number
  totalSeats: number
}

export interface ScreenLayout {
  screenId: string
  screenName: string
  screenPosition: 'front' | 'center' | 'back'
  totalSeats: number
  categories: SeatCategory[]
  seatMap: SeatMapData
}

export interface SeatMapData {
  rows: number
  seatsPerRow: number
  layout: SeatInfo[][]
}

export interface SeatInfo {
  id: string
  row: string
  number: number
  category: string
  isAvailable: boolean
  isBlocked?: boolean
}

export interface TheaterSeatLayout {
  theaterId: string
  theaterName: string
  totalScreens: number
  screens: ScreenLayout[]
  ipfsHash?: string
  lastUpdated: string
}

export interface BookingData {
  eventId: string
  theaterId: string
  screenId: string
  showtime: string
  selectedSeats: SeatInfo[]
  totalPrice: number
  userEmail?: string
}