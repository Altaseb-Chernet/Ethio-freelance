// client/src/pages/Dashboard.jsx
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsAPI, bidsAPI, chatAPI } from '../utils/api'
import { 
  Briefcase, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle,
  X,
  Users,
  FileText,
  Plus,
  Search
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, isClient, isFreelancer } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.getAll({ client: isClient ? 'me' : '' }),
    enabled: isClient
  })

  const { data: bidsData } = useQuery({
    queryKey: ['my-bids'],
    queryFn: () => bidsAPI.getMyBids(),
    enabled: isFreelancer
  })

  const { data: contractsData } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => chatAPI.getContracts(),
    enabled: !!user // Use user object to check if authenticated
  })

  const acceptBidMutation = useMutation({
    mutationFn: ({ jobId, bidId }) => jobsAPI.acceptBid(jobId, { bidId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs'])
      queryClient.invalidateQueries(['contracts'])
      navigate('/messages')
    }
  })

  const handleAcceptBid = (jobId, bidId) => {
    if (window.confirm('Accept this proposal and start the contract?')) {
      acceptBidMutation.mutate({ jobId, bidId })
    }
  }

  // If user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.profile?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your {isClient ? 'projects' : 'freelance work'} today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Dashboard */}
        {isClient && (
          <>
            {/* Your Jobs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Jobs</h2>
                  <Link to="/create-job" className="btn-primary text-sm flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Post Job</span>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {jobsData?.data.data.jobs?.map((job) => (
                    <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {job.budget.type === 'fixed' ? `$${job.budget.fixed}` : `$${job.budget.min}-$${job.budget.max}`}
                          </div>
                          <div className={`badge ${
                            job.status === 'open' ? 'badge-success' :
                            job.status === 'in-progress' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {job.status.replace('-', ' ')}
                          </div>
                        </div>
                      </div>

                      {/* Job Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.skillsRequired?.slice(0, 3).join(', ') || 'No skills specified'}</span>
                          <span>{job.duration}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="btn-secondary text-sm px-3 py-1"
                          >
                            View Details
                          </Link>
                          {job.bids && job.bids.length > 0 && job.status === 'open' && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              {job.bids.length} proposals
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Show accepted freelancer */}
                      {job.selectedFreelancer && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Contract with {job.selectedFreelancer.freelancerId.profile.firstName}</span>
                            <Link
                              to="/messages"
                              className="text-primary-600 hover:text-primary-700 ml-auto"
                            >
                              Message
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {(!jobsData?.data.data.jobs || jobsData.data.data.jobs.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No jobs posted yet</p>
                      <Link to="/create-job" className="btn-primary mt-4">
                        Post Your First Job
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposals to Review */}
              {jobsData?.data.data.jobs?.some(job => 
                job.status === 'open' && job.bids && job.bids.length > 0
              ) && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposals to Review</h2>
                  <div className="space-y-4">
                    {jobsData.data.data.jobs
                      .filter(job => job.status === 'open' && job.bids && job.bids.length > 0)
                      .map(job => (
                        <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {job.bids.length} proposal{job.bids.length > 1 ? 's' : ''} received
                          </p>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="btn-primary text-sm"
                          >
                            Review Proposals
                          </Link>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Freelancer Dashboard */}
        {isFreelancer && (
          <div className="lg:col-span-2 space-y-6">
            {/* Your Proposals */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Proposals</h2>
                <Link to="/search" className="btn-secondary text-sm flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Find Work</span>
                </Link>
              </div>
              
              <div className="space-y-4">
                {bidsData?.data.data.bids?.map((bid) => (
                  <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{bid.jobId?.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {bid.proposal}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">${bid.price}</div>
                        <div className={`badge ${
                          bid.status === 'accepted' ? 'badge-success' :
                          bid.status === 'rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {bid.status || 'pending'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-500">
                        Submitted {new Date(bid.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/jobs/${bid.jobId?._id}`}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          View Job
                        </Link>
                        {bid.status === 'accepted' && (
                          <Link
                            to="/messages"
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Start Working
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!bidsData?.data.data.bids || bidsData.data.data.bids.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No proposals submitted yet</p>
                    <Link to="/search" className="btn-primary mt-4">
                      Find Jobs to Bid On
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Contracts Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Contracts</h2>
            <div className="space-y-3">
              {contractsData?.data.data.contracts
                ?.filter(contract => contract.status === 'active')
                .map(contract => (
                  <div key={contract._id} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {contract.jobId?.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      With {contract.clientId._id === user._id ? 
                        contract.freelancerId.profile.firstName : 
                        contract.clientId.profile.firstName}
                    </p>
                    <Link
                      to="/messages"
                      className="btn-primary w-full text-sm py-1"
                    >
                      Continue Chat
                    </Link>
                  </div>
                ))
              }
              
              {(!contractsData?.data.data.contracts || 
                contractsData.data.data.contracts.filter(c => c.status === 'active').length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No active contracts</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {isClient && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jobs Posted</span>
                    <span className="font-semibold">{jobsData?.data.data.jobs?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Contracts</span>
                    <span className="font-semibold">
                      {contractsData?.data.data.contracts?.filter(c => c.status === 'active').length || 0}
                    </span>
                  </div>
                </>
              )}
              {isFreelancer && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Proposals</span>
                    <span className="font-semibold">{bidsData?.data.data.bids?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Contracts</span>
                    <span className="font-semibold">
                      {contractsData?.data.data.contracts?.filter(c => c.status === 'active').length || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard