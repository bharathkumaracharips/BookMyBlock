import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginButton } from '../auth/LoginButton'
import { LocationFinder } from '../ui/LocationFinder'
import { LocationService } from '../../services/locationService'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Search for theaters
      const theaters = await LocationService.searchTheaters(searchQuery)
      
      // Also search for events by getting events from all theaters and filtering
      let allEvents: any[] = []
      try {
        for (const theater of theaters.slice(0, 3)) { // Limit to first 3 theaters for performance
          const events = await LocationService.getEventsForTheater(theater.id)
          const matchingEvents = events.filter(event => 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          allEvents.push(...matchingEvents.map(event => ({ ...event, type: 'event' })))
        }
      } catch (eventError) {
        console.warn('Error searching events:', eventError)
      }
      
      // Combine theaters and events
      const combinedResults = [
        ...theaters.map(theater => ({ ...theater, type: 'theater' })),
        ...allEvents
      ]
      
      setSearchResults(combinedResults)
      setShowResults(true)
      
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowResults(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      setShowResults(false)
      setSearchResults([])
    }
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Premium dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">BookMyBlock</span>
          </div>

          {/* Center - Integrated Search with Location */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full" ref={searchRef}>
              {/* Main search container */}
              <form onSubmit={handleSearch} className="relative flex items-center bg-slate-800/50 border border-slate-600/50 rounded-2xl backdrop-blur-sm hover:border-slate-500/50 transition-all duration-300 group">

                {/* Location section */}
                <div className="flex items-center px-4 py-3 border-r border-slate-600/50">
                  <LocationFinder showInNavbar={true} />
                </div>

                {/* Search input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search events, theaters, movies..."
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                  />
                </div>

                {/* Search button */}
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-r-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  <span className="font-medium">Search</span>
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}_${result.id}`}
                          onClick={() => {
                            if (result.type === 'event') {
                              navigate(`/event/${result.id}`)
                            } else {
                              console.log('Selected theater:', result)
                              // Could navigate to theater page or show theater events
                            }
                            setShowResults(false)
                            setSearchQuery('')
                          }}
                          className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {result.type === 'event' ? (
                                <>
                                  <h4 className="text-white font-medium">{result.title}</h4>
                                  <p className="text-sm text-slate-400">{result.theaterName}</p>
                                  <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                    <span>₹{result.ticketPrice}</span>
                                    <span>{new Date(result.date).toLocaleDateString()}</span>
                                    <span>{result.time}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h4 className="text-white font-medium">{result.name}</h4>
                                  <p className="text-sm text-slate-400">{result.location}</p>
                                  <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                    <span>{result.screens} screens</span>
                                    <span>{result.totalSeats} seats</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                result.type === 'event' 
                                  ? 'bg-violet-500/20 text-violet-300' 
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {result.type === 'event' ? 'Event' : 'Theater'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Results */}
              {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-xl z-50">
                  <div className="p-4 text-center">
                    <div className="text-slate-400 mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-300">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-slate-400 mt-1">Try searching for theaters, movies, or locations</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Auth */}
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  )
}