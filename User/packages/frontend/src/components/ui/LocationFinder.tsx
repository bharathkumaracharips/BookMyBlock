import { useState, useEffect, useRef } from 'react'
import { LocationService } from '../../services/locationService'
import { useLocationContext } from '../../contexts/LocationContext'

interface City {
  name: string
  state: string
  latitude: number
  longitude: number
}

interface LocationData {
  latitude: number
  longitude: number
  city: string
  state?: string
  isCurrentLocation?: boolean
}

// Popular Indian cities with coordinates (organized by popularity and region)
const INDIAN_CITIES: City[] = [
  // Major Metro Cities (Tier 1)
  { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  
  // Major Tier 2 Cities
  { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { name: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  
  // Andhra Pradesh & Telangana
  { name: 'Tirupati', state: 'Andhra Pradesh', latitude: 13.6288, longitude: 79.4192 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Nellore', state: 'Andhra Pradesh', latitude: 14.4426, longitude: 79.9865 },
  { name: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373 },
  { name: 'Kadapa', state: 'Andhra Pradesh', latitude: 14.4673, longitude: 78.8242 },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', latitude: 17.0005, longitude: 81.8040 },
  { name: 'Warangal', state: 'Telangana', latitude: 17.9689, longitude: 79.5941 },
  
  // Karnataka
  { name: 'Mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { name: 'Hubli-Dharwad', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
  
  // Tamil Nadu
  { name: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { name: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { name: 'Salem', state: 'Tamil Nadu', latitude: 11.664, longitude: 78.146 },
  
  // Maharashtra
  { name: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { name: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { name: 'Aurangabad', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { name: 'Solapur', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', latitude: 18.6298, longitude: 73.7997 },
  { name: 'Kalyan-Dombivli', state: 'Maharashtra', latitude: 19.2403, longitude: 73.1305 },
  { name: 'Vasai-Virar', state: 'Maharashtra', latitude: 19.4912, longitude: 72.8054 },
  { name: 'Navi Mumbai', state: 'Maharashtra', latitude: 19.0330, longitude: 73.0297 },
  
  // Gujarat
  { name: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { name: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  
  // Uttar Pradesh
  { name: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { name: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
  { name: 'Allahabad', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463 },
  { name: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
  
  // Other States
  { name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { name: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { name: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
  { name: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', latitude: 34.0837, longitude: 74.7973 },
  { name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
  { name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
  { name: 'Howrah', state: 'West Bengal', latitude: 22.5958, longitude: 88.2636 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  { name: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { name: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { name: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { name: 'Raipur', state: 'Chhattisgarh', latitude: 21.2514, longitude: 81.6296 },
  { name: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362 }
]

interface LocationFinderProps {
  onLocationChange?: (location: LocationData) => void
  showInNavbar?: boolean
}

export function LocationFinder({ onLocationChange, showInNavbar = false }: LocationFinderProps = {}) {
  const { userLocation, setUserLocation: setGlobalLocation } = useLocationContext()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use global location as the selected location
  const selectedLocation = userLocation

  // Debug: Log when location changes
  useEffect(() => {
    console.log('🎯 LocationFinder received location update:', selectedLocation)
  }, [selectedLocation])

  // Filter cities based on search query
  const filteredCities = INDIAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debug: Log when userLocation changes
  useEffect(() => {
    console.log('🔍 LocationFinder: userLocation changed to:', JSON.stringify(userLocation))
  }, [userLocation])

  // Refresh location detection
  const refreshLocation = async () => {
    console.log('🔄 LocationFinder: Refreshing location...')
    setLoading(true)
    
    try {
      const location = await LocationService.getCurrentLocation('LocationFinder-Refresh')
      
      console.log('🔄 LocationFinder: LocationService returned:', JSON.stringify(location))
      
      if (location) {
        console.log('✅ LocationFinder: Location refreshed:', JSON.stringify(location))
        console.log('🔄 LocationFinder: About to call setGlobalLocation...')
        console.log('🔄 LocationFinder: Current userLocation before update:', JSON.stringify(userLocation))
        
        setGlobalLocation(location)
        
        console.log('🔄 LocationFinder: setGlobalLocation called')
        
        if (onLocationChange) {
          console.log('🔄 LocationFinder: Calling onLocationChange callback')
          onLocationChange(location)
        }
        
        setIsDropdownOpen(false)
        console.log('✅ LocationFinder: Refresh completed successfully')
      } else {
        console.log('❌ LocationFinder: Could not refresh location - LocationService returned null')
      }
    } catch (error) {
      console.error('❌ LocationFinder: Error refreshing location:', error)
    } finally {
      console.log('🔄 LocationFinder: Setting loading to false')
      setLoading(false)
    }
  }

  // Select a city from the list
  const selectCity = async (city: City) => {
    const locationData: LocationData = {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
      state: city.state,
      isCurrentLocation: false
    }

    // Try to get pincode for the city
    try {
      const pincode = await LocationService.getPincodeFromCity(city.name)
      if (pincode) {
        locationData.pincode = pincode
      }
    } catch (error) {
      console.warn('Could not get pincode for city:', city.name)
    }

    // Update both global and local state
    setGlobalLocation(locationData)
    onLocationChange?.(locationData)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  // Clear selection
  const clearSelection = () => {
    setGlobalLocation({ latitude: 0, longitude: 0, city: '', state: '' })
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {!selectedLocation ? (
        <button
          onClick={() => setIsDropdownOpen(true)}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200 group"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`font-medium whitespace-nowrap ${showInNavbar ? 'text-xs' : 'text-sm'}`}>Select City</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center space-x-2 text-slate-300">
          <div className={`w-2 h-2 rounded-full ${selectedLocation.isCurrentLocation ? 'bg-green-400 animate-pulse' : 'bg-violet-400'}`}></div>
          <svg className={`w-4 h-4 ${selectedLocation.isCurrentLocation ? 'text-green-400' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex flex-col">
            <span className={`font-medium text-white whitespace-nowrap ${showInNavbar ? 'text-xs' : 'text-sm'}`}>
              {selectedLocation.city}
            </span>
            {selectedLocation.state && !showInNavbar && (
              <span className="text-xs text-slate-400">
                {selectedLocation.state}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsDropdownOpen(true)}
            className="ml-1 p-1 hover:bg-slate-700 rounded-full transition-colors duration-200"
          >
            <svg className="w-3 h-3 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-xl z-50">
          {/* Search Input */}
          {/* Debug Info */}
          <div className="p-2 border-b border-slate-600 bg-slate-800">
            <div className="text-xs text-slate-400">
              <div>🔍 Debug Info:</div>
              <div>Global Location: {userLocation ? `${userLocation.city}, ${userLocation.state}` : 'None'}</div>
              <div>Pincode: {userLocation?.pincode || 'None'}</div>
              <div>Is Current: {userLocation?.isCurrentLocation ? 'Yes' : 'No'}</div>
            </div>
            <button
              onClick={() => {
                console.log('🧪 Manual test: Setting Hyderabad location directly')
                const testLocation = {
                  latitude: 17.492075993652314,
                  longitude: 78.39881388343171,
                  city: 'Hyderabad',
                  state: 'Telangana',
                  pincode: '500001',
                  isCurrentLocation: true
                }
                setGlobalLocation(testLocation)
              }}
              className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              🧪 Force Set Hyderabad
            </button>
          </div>

          <div className="p-4 border-b border-slate-600">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors duration-200"
                autoFocus
              />
            </div>
          </div>

          {/* Auto-detection Status */}
          <div className="p-3 border-b border-slate-600 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {userLocation?.isCurrentLocation ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Location auto-detected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-sm text-amber-400">Select your city below</span>
                  </>
                )}
              </div>
              
              {/* Refresh button */}
              <button
                onClick={refreshLocation}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-violet-400 transition-colors duration-200 flex items-center space-x-1"
              >
                {loading ? (
                  <div className="w-3 h-3 border border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>Refresh</span>
              </button>
            </div>
            
            {userLocation?.isCurrentLocation && (
              <div className="text-xs text-slate-400 mt-2">
                Currently showing content for {userLocation.city}
                {userLocation.state && `, ${userLocation.state}`}
              </div>
            )}
          </div>

          {/* Cities List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCities.length > 0 ? (
              <div className="p-2">
                {filteredCities.map((city) => (
                  <button
                    key={`${city.name}-${city.state}`}
                    onClick={() => selectCity(city)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-700 rounded-lg transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-white">{city.name}</div>
                        <div className="text-xs text-slate-400">{city.state}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400">
                <div className="text-sm">No cities found</div>
                <div className="text-xs">Try a different search term</div>
              </div>
            )}
          </div>

          {/* Clear Selection */}
          {selectedLocation && (
            <div className="p-2 border-t border-slate-600">
              <button
                onClick={clearSelection}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm">Clear selection</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}