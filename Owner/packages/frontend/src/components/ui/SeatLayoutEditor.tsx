import { useState } from 'react'
import { TheaterSeatLayout, ScreenLayout, SeatCategory, SEAT_CATEGORIES } from '../../types/seatLayout'
import { Theater } from '../../types/theater'

interface SeatLayoutEditorProps {
  theater: Theater
  seatLayout: TheaterSeatLayout
  onSave: (layout: TheaterSeatLayout) => void
  onBack: () => void
  saving: boolean
}

export function SeatLayoutEditor({ theater, seatLayout, onSave, onBack, saving }: SeatLayoutEditorProps) {
  const [currentLayout, setCurrentLayout] = useState<TheaterSeatLayout>(seatLayout)
  const [selectedScreen, setSelectedScreen] = useState<number>(0)

  const updateScreenLayout = (screenIndex: number, updatedScreen: ScreenLayout) => {
    const updatedLayout = {
      ...currentLayout,
      screens: currentLayout.screens.map((screen, index) => 
        index === screenIndex ? updatedScreen : screen
      ),
      lastUpdated: new Date().toISOString()
    }
    setCurrentLayout(updatedLayout)
  }

  const addCategory = (screenIndex: number) => {
    const screen = currentLayout.screens[screenIndex]
    const newCategory: SeatCategory = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      color: '#6B7280',
      price: 100,
      totalSeats: 0
    }

    const updatedScreen = {
      ...screen,
      categories: [...screen.categories, newCategory]
    }

    updateScreenLayout(screenIndex, updatedScreen)
  }

  const updateCategory = (screenIndex: number, categoryIndex: number, updatedCategory: SeatCategory) => {
    const screen = currentLayout.screens[screenIndex]
    const updatedScreen = {
      ...screen,
      categories: screen.categories.map((cat, index) => 
        index === categoryIndex ? updatedCategory : cat
      )
    }

    updateScreenLayout(screenIndex, updatedScreen)
  }

  const removeCategory = (screenIndex: number, categoryIndex: number) => {
    const screen = currentLayout.screens[screenIndex]
    const updatedScreen = {
      ...screen,
      categories: screen.categories.filter((_, index) => index !== categoryIndex)
    }

    updateScreenLayout(screenIndex, updatedScreen)
  }

  const updateScreenPosition = (screenIndex: number, position: 'front' | 'center' | 'back') => {
    const screen = currentLayout.screens[screenIndex]
    const updatedScreen = { ...screen, screenPosition: position }
    updateScreenLayout(screenIndex, updatedScreen)
  }

  const handleSave = () => {
    onSave(currentLayout)
  }

  const currentScreen = currentLayout.screens[selectedScreen]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Theaters</span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{theater.name}</h1>
              <p className="text-slate-400">{theater.location}</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save to IPFS</span>
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Screen Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Screens</h3>
              <div className="space-y-2">
                {currentLayout.screens.map((screen, index) => (
                  <button
                    key={screen.screenId}
                    onClick={() => setSelectedScreen(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedScreen === index
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium">{screen.screenName}</div>
                    <div className="text-sm opacity-75">
                      {screen.categories.length} categories • {screen.totalSeats} seats
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentScreen && (
              <div className="space-y-6">
                {/* Screen Info */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">{currentScreen.screenName}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Screen Position
                      </label>
                      <select
                        value={currentScreen.screenPosition}
                        onChange={(e) => updateScreenPosition(selectedScreen, e.target.value as any)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="front">Front</option>
                        <option value="center">Center</option>
                        <option value="back">Back</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Total Seats
                      </label>
                      <input
                        type="number"
                        value={currentScreen.totalSeats}
                        onChange={(e) => {
                          const updatedScreen = { ...currentScreen, totalSeats: parseInt(e.target.value) || 0 }
                          updateScreenLayout(selectedScreen, updatedScreen)
                        }}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seat Categories */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Seat Categories</h3>
                    <button
                      onClick={() => addCategory(selectedScreen)}
                      className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentScreen.categories.map((category, categoryIndex) => (
                      <div key={category.id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="grid md:grid-cols-5 gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Category Name
                            </label>
                            <select
                              value={category.name}
                              onChange={(e) => {
                                const selectedCat = SEAT_CATEGORIES.find(cat => cat.name === e.target.value)
                                const updatedCategory = {
                                  ...category,
                                  name: e.target.value,
                                  color: selectedCat?.color || category.color,
                                  price: selectedCat?.defaultPrice || category.price
                                }
                                updateCategory(selectedScreen, categoryIndex, updatedCategory)
                              }}
                              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                            >
                              {SEAT_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-8 h-8 rounded border border-slate-500"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <input
                                type="color"
                                value={category.color}
                                onChange={(e) => updateCategory(selectedScreen, categoryIndex, { ...category, color: e.target.value })}
                                className="w-8 h-8 rounded border border-slate-500 bg-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              value={category.price}
                              onChange={(e) => updateCategory(selectedScreen, categoryIndex, { ...category, price: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Seats Count
                            </label>
                            <input
                              type="number"
                              value={category.totalSeats}
                              onChange={(e) => updateCategory(selectedScreen, categoryIndex, { ...category, totalSeats: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                            />
                          </div>

                          <div>
                            <button
                              onClick={() => removeCategory(selectedScreen, categoryIndex)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {currentScreen.categories.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p>No seat categories configured yet.</p>
                        <p className="text-sm">Click "Add Category" to get started.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-400">
                        {currentScreen.categories.reduce((sum, cat) => sum + cat.totalSeats, 0)}
                      </div>
                      <div className="text-sm text-slate-400">Total Configured Seats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        ₹{currentScreen.categories.reduce((sum, cat) => sum + (cat.price * cat.totalSeats), 0)}
                      </div>
                      <div className="text-sm text-slate-400">Total Revenue Potential</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400">
                        {currentScreen.categories.length}
                      </div>
                      <div className="text-sm text-slate-400">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}