import { useAuth } from '../../hooks/useAuth'
import { ActivityLogger } from '../ActivityLogger'

export function HomePage() {
    const { authenticated, user } = useAuth()

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
                    <div className="text-center py-20">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Welcome back, {user?.email?.split('@')[0] || user?.phone || 'User'}!
                            </h1>
                            <p className="text-lg text-slate-300 mb-12">
                                Ready to discover amazing events and book your next experience?
                            </p>
                            
                            {/* Activity Logger Section */}
                            <div className="mb-12">
                                <ActivityLogger />
                            </div>
                            
                            {/* Main Action Cards */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Browse Events</h3>
                                    <p className="text-sm text-slate-400">Discover concerts, sports, and entertainment</p>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Find Venues</h3>
                                    <p className="text-sm text-slate-400">Book spaces for your events</p>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">My Tickets</h3>
                                    <p className="text-sm text-slate-400">View and manage your bookings</p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                                <div className="grid grid-cols-3 divide-x divide-slate-700">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">0</div>
                                        <div className="text-sm text-slate-400">Events Booked</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">₹0</div>
                                        <div className="text-sm text-slate-400">Total Spent</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">0</div>
                                        <div className="text-sm text-slate-400">Upcoming Events</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}