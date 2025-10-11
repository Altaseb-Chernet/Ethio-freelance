// client/src/pages/FreelancerProfile.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersAPI } from '../utils/api'
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Award, 
  MessageSquare,
  DollarSign,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

const FreelancerProfile = () => {
  const { id } = useParams()
  
  const { data: profileData } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => usersAPI.getProfile(id)
  })

  const freelancer = profileData?.data.data.user

  if (!freelancer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-semibold text-2xl">
              {freelancer.profile.firstName?.[0]}{freelancer.profile.lastName?.[0]}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {freelancer.profile.firstName} {freelancer.profile.lastName}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {freelancer.profile.bio || 'Freelancer'}
                </p>
              </div>
              <button className="btn-primary flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Contact</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Available for work</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(freelancer.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700">
                {freelancer.profile.bio || 'No bio available.'}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {freelancer.profile.skills?.map((skill, index) => (
                <span key={index} className="badge badge-primary text-base px-4 py-2">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          {freelancer.profile.portfolio && freelancer.profile.portfolio.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freelancer.profile.portfolio.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {freelancer.rating.reviews.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Client Reviews ({freelancer.rating.count})
              </h2>
              <div className="space-y-4">
                {freelancer.rating.reviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating */}
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {freelancer.rating.average > 0 ? freelancer.rating.average.toFixed(1) : 'N/A'}
            </div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(freelancer.rating.average) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {freelancer.rating.count} reviews
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Hourly Rate</h3>
            <div className="text-2xl font-bold text-gray-900">
              ${freelancer.profile.hourlyRate}/hr
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earned</span>
                <span className="font-medium">${freelancer.wallet.totalEarned.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jobs Completed</span>
                <span className="font-medium">{freelancer.rating.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">1-2 hours</span>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verification</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone Verified</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ID Verified</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreelancerProfile