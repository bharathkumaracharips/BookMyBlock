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

export const SEAT_CATEGORIES = [
  { id: 'recliner', name: 'Recliner', color: '#8B5CF6', defaultPrice: 350 },
  { id: 'vip', name: 'VIP', color: '#F59E0B', defaultPrice: 250 },
  { id: 'platinum', name: 'Platinum', color: '#10B981', defaultPrice: 200 },
  { id: 'gold', name: 'Gold', color: '#EF4444', defaultPrice: 150 },
  { id: 'silver', name: 'Silver', color: '#6B7280', defaultPrice: 100 }
] as const