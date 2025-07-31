import  { useState, useEffect } from 'react'
import { 
  Building2, 
  Eye, 
  Check, 
  X, 
  Clock, 
  FileText, 
  User, 
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { adminTheaterService, TheaterApplication, AdminDashboardStats } from '../../services/adminTheaterService'

export function TheaterReviewDashboard() {
  const [applications, setApplications] = useState<TheaterApplication[]>([])
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<TheaterApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pendingApps, dashboardStats] = await Promise.all([
        adminTheaterService.getPendingApplications(),
        adminTheaterService.getDashboardStats()
      ])
      
      setApplications(pendingApps)
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading theater applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (application: TheaterApplication) => {
    if (!confirm(`Are you sure you want to approve "${application.theaterName}"?`)) {
      return
    }

    try {
      setActionLoading(true)
      await adminTheaterService.approveApplication(application.id, adminNotes)
      
      alert(`✅ Theater "${application.theaterName}" has been approved successfully!`)
      
      // Refresh data
      await loadData()
      setSelectedApplication(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Error approving application. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.')
      return
    }

    try {
      setActionLoading(true)
      await adminTheaterService.rejectApplication(
        selectedApplication.id, 
        rejectionReason, 
        adminNotes
      )
      
      alert(`❌ Theater "${selectedApplication.theaterName}" has been rejected.`)
      
      // Refresh data
      await loadData()
      setSelectedApplication(null)
      setShowRejectModal(false)
      setRejectionReason('')
      setAdminNotes('')
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Error rejecting application. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <span className="ml-2 text-white">Loading theater applications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Theater Review Dashboard</h1>
          <p className="text-slate-300">Review and manage pending theater registration applications</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Applications</p>
                  <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
                </div>
                <Building2 className="h-8 w-8 text-violet-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingApplications}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats.approvedApplications}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{stats.rejectedApplications}</p>
                </div>
                <X className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Pending Applications ({applications.length})</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pending applications</h3>
              <p className="text-slate-400">All theater applications have been reviewed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Theater
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-slate-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-white">{application.theaterName}</div>
                            <div className="text-sm text-slate-400">{application.numberOfScreens} screens • {application.totalSeats} seats</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{application.ownerName}</div>
                          <div className="text-sm text-slate-400">{application.ownerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {application.city}, {application.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        GST: {application.gstNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(application.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-violet-400 hover:text-violet-300 p-1 rounded"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {application.pdfHash && (
                            <a
                              href={adminTheaterService.getIPFSUrl(application.pdfHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 p-1 rounded"
                              title="View PDF"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Theater Application Review</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Theater Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Theater Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-400">Name:</span> <span className="text-white">{selectedApplication.theaterName}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span className="text-white">{selectedApplication.address}</span></div>
                      <div><span className="text-slate-400">Location:</span> <span className="text-white">{selectedApplication.city}, {selectedApplication.state} - {selectedApplication.pincode}</span></div>
                      <div><span className="text-slate-400">Screens:</span> <span className="text-white">{selectedApplication.numberOfScreens}</span></div>
                      <div><span className="text-slate-400">Total Seats:</span> <span className="text-white">{selectedApplication.totalSeats}</span></div>
                      <div><span className="text-slate-400">Parking:</span> <span className="text-white">{selectedApplication.parkingSpaces}</span></div>
                      <div><span className="text-slate-400">Amenities:</span> <span className="text-white">{selectedApplication.amenities?.join(', ') || 'None'}</span></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Owner Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-slate-400">Name:</span> <span className="text-white">{selectedApplication.ownerName}</span></div>
                      <div><span className="text-slate-400">Email:</span> <span className="text-white">{selectedApplication.ownerEmail}</span></div>
                      <div><span className="text-slate-400">Phone:</span> <span className="text-white">{selectedApplication.ownerPhone}</span></div>
                      <div><span className="text-slate-400">GST Number:</span> <span className="text-white">{selectedApplication.gstNumber}</span></div>
                      <div><span className="text-slate-400">Submitted:</span> <span className="text-white">{formatDate(selectedApplication.submittedAt)}</span></div>
                    </div>
                  </div>
                </div>

                {/* PDF Preview */}
                {selectedApplication.pdfHash && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Documents
                    </h4>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Theater Application PDF</p>
                          <p className="text-slate-400 text-sm">IPFS Hash: {selectedApplication.pdfHash}</p>
                        </div>
                        <a
                          href={adminTheaterService.getIPFSUrl(selectedApplication.pdfHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          View PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Admin Notes (Optional)</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this application..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication)}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  Reject Application
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-300">
                  Please provide a reason for rejecting "{selectedApplication?.theaterName}":
                </p>
                
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason (required)..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectionReason('')
                    }}
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || actionLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}