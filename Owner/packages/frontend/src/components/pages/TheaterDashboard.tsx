import React, { useState } from 'react'
import { Plus, Building2, Users, Calendar, Settings, Eye, Loader2 } from 'lucide-react'
import { AddTheaterForm } from '../theater/AddTheaterForm'
import { useTheater } from '../../hooks/useTheater'
import { Theater } from '../../types/theater'

export function TheaterDashboard() {
  const [showAddForm, setShowAddForm] = useState(false)
  const { theaters, stats, loading, error, submitTheater } = useTheater()

  const handleAddTheater = async (theaterData: any): Promise<boolean> => {
    try {
      console.log('🎯 Submitting theater data:', theaterData)
      const result = await submitTheater(theaterData)
      if (result) {
        setShowAddForm(false)
        alert(`🎉 Theater application submitted successfully!\n\n📄 PDF Hash: ${theaterData.pdfHash}\n�  View PDF: ${theaterData.ipfsUrls?.pdf}\n\nYour application will be reviewed within 2-3 business days.`)
        return true
      } else {
        console.error('❌ submitTheater returned null')
        alert('Error submitting theater application. Please try again.')
        return false
      }
    } catch (error) {
      console.error('❌ Error in handleAddTheater:', error)
      alert('Error submitting theater application. Please try again.')
      return false
    }
  }

  const getStatusBadge = (status: Theater['status']) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const handlePreviewApplication = (theater: Theater) => {
    if (theater.pdfHash) {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${theater.pdfHash}`
      console.log('🔍 Opening IPFS URL:', ipfsUrl)
      window.open(ipfsUrl, '_blank')
    } else {
      alert('No application document available')
    }
  }

  const handleCopyText = async (text?: string | null, label: string = 'Text') => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text)
        alert(`${label} copied to clipboard!`)
        console.log(`📋 Copied ${label}:`, text)
      } catch (error) {
        console.error(`Failed to copy ${label}:`, error)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert(`${label} copied to clipboard!`)
      }
    } else {
      alert(`No ${label.toLowerCase()} available`)
    }
  }

  if (showAddForm) {
    return (
      <AddTheaterForm
        onSubmit={handleAddTheater}
        onCancel={() => setShowAddForm(false)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theater Management</h1>
          <p className="text-gray-600 mt-1">Manage your theaters and track their performance</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add New Theater
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Theaters</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalTheaters || theaters.length)}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-violet-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Theaters</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.activeTheaters || theaters.filter(t => t.status === 'active').length)}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Screens</p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalScreens || theaters.reduce((sum, t) => sum + t.screens, 0))}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.totalSeats || theaters.reduce((sum, t) => sum + t.totalSeats, 0))}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Theaters List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Your Theaters</h2>
        </div>
        
        {theaters.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No theaters yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first theater</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
            >
              Add Theater
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {theaters.map((theater) => (
                  <tr key={theater.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{theater.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(theater.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {theater.id ? `${theater.id.substring(0, 12)}...` : 'N/A'}
                        </span>
                        <button 
                          onClick={() => handleCopyText(theater.id, 'Application ID')}
                          className="text-blue-500 hover:text-blue-700"
                          title="Copy Application ID"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {theater.blockchainTxHash ? `${theater.blockchainTxHash.substring(0, 12)}...` : 'Loading...'}
                        </span>
                        {theater.blockchainTxHash && (
                          <button 
                            onClick={() => handleCopyText(theater.blockchainTxHash, 'Transaction Hash')}
                            className="text-blue-500 hover:text-blue-700"
                            title="Copy Transaction Hash"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(theater.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Preview PDF Button */}
                        <button 
                          onClick={() => handlePreviewApplication(theater)}
                          className="text-violet-600 hover:text-violet-900 flex items-center gap-1"
                          title="View Application PDF"
                        >
                          <Eye size={16} />
                          <span className="text-xs">View</span>
                        </button>
                        
                        {/* Copy IPFS Hash Button */}
                        <button 
                          onClick={() => handleCopyIPFSHash(theater.pdfHash)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Copy IPFS Hash"
                        >
                          <Settings size={16} />
                          <span className="text-xs">Copy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}