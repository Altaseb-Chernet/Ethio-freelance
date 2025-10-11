// client/src/components/FreelancerCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Briefcase, DollarSign, Award } from 'lucide-react'

const FreelancerCard = ({ freelancer }) => {
  const {
    _id,
    profile,
    rating,
    wallet
  } = freelancer

  return (
    <Link
      to={`/profile/${_id}`}
      className="card p-6 block hover:border-primary-300 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start space-x-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 font-semibold text-lg">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {profile.bio || 'No bio available'}
          </p>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900">
                {rating.average > 0 ? rating.average.toFixed(1) : 'No ratings'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({rating.count} reviews)
            </span>
          </div>

          {/* Hourly Rate */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>${profile.hourlyRate}/hr</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {profile.skills?.slice(0, 5).map((skill, index) => (
          <span key={index} className="badge badge-primary text-xs">
            {skill}
          </span>
        ))}
        {profile.skills?.length > 5 && (
          <span className="badge badge-secondary text-xs">
            +{profile.skills.length - 5} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-1">
          <Briefcase className="w-4 h-4" />
          <span>{wallet?.totalEarned > 0 ? 'Experienced' : 'New'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>Remote</span>
        </div>
      </div>
    </Link>
  )
}

export default FreelancerCard