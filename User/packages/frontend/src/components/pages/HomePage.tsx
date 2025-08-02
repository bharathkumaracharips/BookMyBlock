import { useSimpleAuth } from '../../hooks/useSimpleAuth'
import { useLocationTheaters } from '../../hooks/useLocationTheaters'
import { useLocationContext } from '../../contexts/LocationContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
    const { authenticated, user } = useSimpleAuth()
    const navigate = useNavigate()
    const { userLocation } = useLocationContext()
    const { 
        theaters, 
        events, 
        loading, 
        error
    } = useLocationTheaters()
    
    const [showAllTheaters, setShowAllTheaters] = useState(false)
    const [showAllEvents, setShowAllEvents] = useState(false)

    // Debug: Log location in HomePage
    useEffect(() => {
        console.log('🏠 HomePage received location:', userLocation)
    }, [userLocation])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {!authenticated ? (
                    // Show welcome message for non-authenticated users
                    <div className="text-center py-20">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-5xl font-bold text-white mb-6">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">BookMyBlock</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8">
                                Discover and book amazing events, venues, and experiences with blockchain-powered ticketing
                            </p>
                            <div className="flex items-center justify-center space-x-8 text-slate-400">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Secure Blockchain Tickets</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Instant Booking</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Digital Wallet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Show main content for authenticated users
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header with Location */}
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-white mb-4">
                                    Welcome back, {user?.email?.split('@')[0] || user?.phone || 'User'}!
                                </h1>

                                {userLocation && (
                                    <div className="text-center">
                                        <p className="text-lg text-slate-300">
                                            Showing events and theaters near <span className="text-violet-400 font-medium">{userLocation.city}</span>
                                            {userLocation.state && <span className="text-slate-400">, {userLocation.state}</span>}
                                        </p>
                                        {userLocation.pincode ? (
                                            <p className="text-sm text-slate-400">
                                                Pincode: {userLocation.pincode}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-amber-400 flex items-center justify-center space-x-1 mt-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <span>Searching by city (pincode not detected)</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-8">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-300">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center space-x-2">
                                        <div className="w-6 h-6 border-2 border-slate-600 border-t-violet-500 rounded-full animate-spin"></div>
                                        <span className="text-slate-300">Finding theaters and events near you...</span>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            {!loading && (
                                <>
                                    {/* Nearby Events Section */}
                                    {events.length > 0 && (
                                        <div className="mb-12">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold text-white">Upcoming Events Near You</h2>
                                                {events.length > 3 && (
                                                    <button
                                                        onClick={() => setShowAllEvents(!showAllEvents)}
                                                        className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors duration-200"
                                                    >
                                                        {showAllEvents ? 'Show Less' : `View All ${events.length} Events`}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {(showAllEvents ? events : events.slice(0, 3)).map((event) => (
                                                    <div 
                                                        key={event.id} 
                                                        onClick={() => navigate(`/event/${event.id}`)}
                                                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group transform hover:scale-105"
                                                    >
                                                        {/* Event Poster */}
                                                        {event.imageUrl && (
                                                            <div className="mb-4 rounded-lg overflow-hidden">
                                                                <img 
                                                                    src={event.imageUrl} 
                                                                    alt={event.title}
                                                                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors duration-200">
                                                                    {event.title}
                                                                </h3>
                                                                <p className="text-sm text-slate-400 mb-2">{event.theaterName}</p>
                                                                <p className="text-xs text-slate-500">{event.theaterLocation}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-violet-400">₹{event.ticketPrice}</div>
                                                                <div className="text-xs text-slate-400">{event.availableSeats} seats left</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm text-slate-300">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>{event.time}</span>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                                                {event.category}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Click indicator */}
                                                        <div className="mt-4 text-center">
                                                            <span className="text-xs text-slate-500 group-hover:text-violet-400 transition-colors duration-200">
                                                                Click to view details →
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nearby Theaters Section */}
                                    {theaters.length > 0 && (
                                        <div className="mb-12">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold text-white">Theaters Near You</h2>
                                                {theaters.length > 4 && (
                                                    <button
                                                        onClick={() => setShowAllTheaters(!showAllTheaters)}
                                                        className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors duration-200"
                                                    >
                                                        {showAllTheaters ? 'Show Less' : `View All ${theaters.length} Theaters`}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {(showAllTheaters ? theaters : theaters.slice(0, 4)).map((theater) => (
                                                    <div key={theater.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                            {theater.distance !== undefined && (
                                                                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                                                                    ~{theater.distance}km
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-200">
                                                            {theater.name}
                                                        </h3>
                                                        <p className="text-sm text-slate-400 mb-3">{theater.location}</p>
                                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                                            <span>{theater.screens} screens</span>
                                                            <span>{theater.totalSeats} seats</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results State */}
                                    {!loading && theaters.length === 0 && events.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">No theaters found in your area</h3>
                                            <p className="text-slate-400 mb-6">
                                                {userLocation 
                                                    ? `We couldn't find any theaters near ${userLocation.city}. Try selecting a different location.`
                                                    : 'Select your location to find nearby theaters and events.'
                                                }
                                            </p>
                                            <div className="text-center">
                                                <p className="text-slate-400 mb-4">
                                                    Use the location selector in the navbar above to find theaters near you.
                                                </p>
                                                <div className="flex items-center justify-center space-x-2 text-violet-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                    </svg>
                                                    <span className="text-sm">Select your location in the search bar above</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Stats */}
                                    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                                        <div className="grid grid-cols-3 divide-x divide-slate-700">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-1">{events.length}</div>
                                                <div className="text-sm text-slate-400">Available Events</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-1">{theaters.length}</div>
                                                <div className="text-sm text-slate-400">Nearby Theaters</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-1">
                                                    {userLocation?.city || 'Select Location'}
                                                </div>
                                                <div className="text-sm text-slate-400">Your Area</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}