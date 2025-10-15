// client/src/pages/JobDetails.jsx
// client/src/pages/JobDetails.jsx
import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsAPI, bidsAPI, aiAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Star, 
  Clock,
  Send,
  Sparkles,
  Users,
  CheckCircle,
  X
} from 'lucide-react'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isFreelancer } = useAuth()
  const queryClient = useQueryClient()
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidData, setBidData] = useState({
    proposal: '',
    price: '',
    estimatedTime: { value: '', unit: 'days' }
  })
  const [enhancedProposal, setEnhancedProposal] = useState(null)

  const { data: jobData } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getById(id)
  })

  const createBidMutation = useMutation({
    mutationFn: (data) => bidsAPI.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id])
      setShowBidForm(false)
      setBidData({ proposal: '', price: '', estimatedTime: { value: '', unit: 'days' } })
    }
  })

  const enhanceProposalMutation = useMutation({
    mutationFn: (data) => aiAPI.enhanceProposal(data),
    onSuccess: (response) => {
      setEnhancedProposal(response.data.data)
      setBidData(prev => ({ ...prev, proposal: response.data.data.enhancedProposal }))
    }
  })

  const acceptBidMutation = useMutation({
    mutationFn: (bidId) => jobsAPI.acceptBid(job?._id, { bidId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id])
      queryClient.invalidateQueries(['contracts'])
      navigate('/messages')
    },
    onError: (error) => console.error('Failed to accept bid:', error)
  })

  const job = jobData?.data?.data?.job
  const bids = jobData?.data?.data?.bids || []

  // ✅ Optional chaining to prevent null errors
  const hasUserBid = bids?.some(bid => bid.freelancerId?._id === user?._id) || false
  const isClient = user?.role === 'client'

  const handleEnhanceProposal = () => {
    if (bidData.proposal && job) {
      enhanceProposalMutation.mutate({
        proposal: bidData.proposal,
        jobDescription: job.description
      })
    }
  }

  const handleSubmitBid = (e) => {
    e.preventDefault()
    createBidMutation.mutate({
      ...bidData,
      price: Number(bidData.price),
      estimatedTime: {
        ...bidData.estimatedTime,
        value: Number(bidData.estimatedTime.value)
      }
    })
  }

  const handleAcceptBid = (bidId) => {
    if (window.confirm('Are you sure you want to accept this proposal? This will start the contract and notify the freelancer.')) {
      acceptBidMutation.mutate(bidId)
    }
  }

  const handleRejectBid = (bidId) => {
    if (window.confirm('Are you sure you want to reject this proposal?')) {
      console.log('Reject bid:', bidId)
      // Implement reject bid functionality here
    }
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{job.duration.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {job.budget?.type === 'fixed' ? `$${job.budget?.fixed}` : `$${job.budget?.min}-$${job.budget?.max}/hr`}
            </div>
            <div className="text-sm text-gray-500">Budget</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Required Skills */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired?.map((skill, index) => (
                <span key={index} className="badge badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Bids Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Proposals ({bids.length})
              </h2>
              {isFreelancer && !hasUserBid && job.status === 'open' && (
                <button
                  onClick={() => setShowBidForm(true)}
                  className="btn-primary"
                >
                  Submit Proposal
                </button>
              )}
            </div>

            {/* Bid Form */}
            {showBidForm && (
              <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Proposal</h3>
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  {/* Proposal Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proposal *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={bidData.proposal}
                      onChange={(e) => setBidData(prev => ({ ...prev, proposal: e.target.value }))}
                      className="input resize-none"
                      placeholder="Describe why you're the best fit for this project..."
                    />
                    <button
                      type="button"
                      onClick={handleEnhanceProposal}
                      disabled={!bidData.proposal}
                      className="mt-2 btn-secondary text-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI Enhance</span>
                    </button>
                  </div>

                  {enhancedProposal && (
                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-primary-700 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Enhanced Proposal</span>
                      </div>
                      <p className="text-sm text-primary-600 mb-2">
                        Confidence: {Math.round(enhancedProposal.confidenceScore * 100)}%
                      </p>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {enhancedProposal.enhancedProposal}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Price ($) *
                      </label>
                      <input
                        type="number"
                        required
                        value={bidData.price}
                        onChange={(e) => setBidData(prev => ({ ...prev, price: e.target.value }))}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Time *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          required
                          value={bidData.estimatedTime.value}
                          onChange={(e) => setBidData(prev => ({ 
                            ...prev, 
                            estimatedTime: { ...prev.estimatedTime, value: e.target.value }
                          }))}
                          className="input flex-1"
                          min="1"
                          placeholder="Duration"
                        />
                        <select
                          value={bidData.estimatedTime.unit}
                          onChange={(e) => setBidData(prev => ({ 
                            ...prev, 
                            estimatedTime: { ...prev.estimatedTime, unit: e.target.value }
                          }))}
                          className="input w-24"
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowBidForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createBidMutation.isLoading}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{createBidMutation.isLoading ? 'Submitting...' : 'Submit Proposal'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bids List */}
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {bid.freelancerId?.profile?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {bid.freelancerId?.profile?.firstName} {bid.freelancerId?.profile?.lastName}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{bid.freelancerId?.rating?.average ?? 'No ratings'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${bid.price}</div>
                      <div className="text-sm text-gray-500">
                        {bid.estimatedTime?.value} {bid.estimatedTime?.unit}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {bid.proposal}
                  </p>
                  
                  {/* Bid Actions for Client */}
                  {isClient && job.status === 'open' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleAcceptBid(bid._id)}
                        className="btn-success text-sm px-4 py-2 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Proposal</span>
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid._id)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Reject
                      </button>
                      <Link
                        to={`/profile/${bid.freelancerId?._id}`}
                        className="btn-ghost text-sm px-4 py-2"
                      >
                        View Profile
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Submitted {new Date(bid.createdAt).toLocaleDateString()}</span>
                    {bid.status === 'accepted' && (
                      <span className="badge badge-success flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {bid.status === 'rejected' && (
                      <span className="badge badge-error flex items-center space-x-1">
                        <X className="w-3 h-3" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {bids.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No proposals yet. Be the first to submit a bid!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">About the Client</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {job.clientId?.profile?.firstName?.[0] || 'C'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {job.clientId?.profile?.firstName} {job.clientId?.profile?.lastName}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{job.clientId?.rating?.average ?? 'No ratings'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium">
                  {job.budget?.type === 'fixed' ? `$${job.budget?.fixed}` : `$${job.budget?.min}-$${job.budget?.max}/hr`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{job.duration?.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`badge ${
                  job.status === 'open' ? 'badge-success' :
                  job.status === 'in-progress' ? 'badge-warning' : 'badge-error'
                }`}>
                  {job.status?.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skills Required</span>
                <span className="font-medium">{job.skillsRequired?.length}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isFreelancer && job.status === 'open' && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ready to Work?</h3>
              {hasUserBid ? (
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">You've already submitted a proposal</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowBidForm(true)}
                  className="w-full btn-primary py-3"
                >
                  Submit Proposal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDetails
