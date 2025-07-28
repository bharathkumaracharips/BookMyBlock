import { useSimpleAuth } from '../../hooks/useSimpleAuth'

export function HomePage() {
    const { authenticated, user } = useSimpleAuth()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {!authenticated ? (
                    // Show welcome message for non-authenticated users
                    <div className="text-center py-20">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-5xl font-bold text-white mb-6">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">BookMyBlock Owner</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8">
                                Manage your venues, events, and business operations with blockchain-powered ownership tools
                            </p>
                            <div className="flex items-center justify-center space-x-8 text-slate-400">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>Venue Management</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <span>Revenue Analytics</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Business Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Show main content for authenticated users
                    <div className="text-center py-20">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Welcome back, Owner {user?.email?.split('@')[0] || user?.phone || 'User'}!
                            </h1>
                            <p className="text-lg text-slate-300 mb-12">
                                Ready to manage your venues and monitor business performance?
                            </p>
                            
                            {/* Main Action Cards */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Manage Venues</h3>
                                    <p className="text-sm text-slate-400">Add and manage your venues</p>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Manage Events</h3>
                                    <p className="text-sm text-slate-400">Create and manage events</p>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Revenue</h3>
                                    <p className="text-sm text-slate-400">Track earnings and analytics</p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                                <div className="grid grid-cols-3 divide-x divide-slate-700">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">0</div>
                                        <div className="text-sm text-slate-400">Total Venues</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">0</div>
                                        <div className="text-sm text-slate-400">Total Events</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">₹0</div>
                                        <div className="text-sm text-slate-400">Total Revenue</div>
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