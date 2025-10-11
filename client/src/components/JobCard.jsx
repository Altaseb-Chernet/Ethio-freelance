// client/src/components/JobCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, DollarSign, MapPin, Star, Clock } from 'lucide-react'

const JobCard = ({ job }) => {
  const formatBudget = (budget) => {
    if (budget.type === 'fixed') {
      return `$${budget.fixed}`
    }
    return `$${budget.min} - $${budget.max}/hr`
  }

  const formatDuration = (duration) => {
    const durationMap = {
      'less-than-week': 'Less than 1 week',
      '1-2 weeks': '1-2 weeks',
      '2-4 weeks': '2-4 weeks',
      '1-3 months': '1-3 months',
      '3+ months': '3+ months'
    }
    return durationMap[duration] || duration
  }

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card p-6 block hover:border-primary-300 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {job.title}
          </h3>
          <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
            {job.description}
          </p>
        </div>
        <div className="text-right ml-4 min-w-[120px]">
          <div className="text-xl font-bold text-gray-900">
            {formatBudget(job.budget)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatDuration(job.duration)}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skillsRequired.slice(0, 4).map((skill, index) => (
          <span key={index} className="badge badge-primary text-xs">
            {skill}
          </span>
        ))}
        {job.skillsRequired.length > 4 && (
          <span className="badge badge-secondary text-xs">
            +{job.skillsRequired.length - 4} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Remote</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>{job.clientId?.rating?.average || 'New'}</span>
        </div>
      </div>
    </Link>
  )
}

export default JobCard