export interface TheaterFormData {
  // Owner Details
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  ownerPanCard: FileList
  ownerAadharFront: FileList
  ownerAadharBack: FileList
  
  // Theater Details
  theaterName: string
  address: string
  city: string
  state: string
  pincode: string
  numberOfScreens: number
  totalSeats: number
  parkingSpaces: number
  amenities?: string[]
  
  // Legal Documents
  gstNumber: string
  cinemaLicense: FileList
  fireNoc: FileList
  buildingPermission: FileList
  tradeLicense?: FileList
  insurancePolicy?: FileList
}

export interface Theater {
  id: string
  name: string
  location: string
  screens: number
  status: 'active' | 'pending' | 'inactive' | 'rejected'
  totalSeats: number
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  createdAt: string
  updatedAt: string
  amenities?: string[]
  gstNumber?: string
  parkingSpaces?: number
}

export interface TheaterStats {
  totalTheaters: number
  activeTheaters: number
  pendingTheaters: number
  totalScreens: number
  totalSeats: number
}