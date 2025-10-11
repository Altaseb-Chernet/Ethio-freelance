// client/src/pages/SearchResults.jsx
import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jobsAPI } from '../utils/api'
import { Search, Filter, MapPin, Calendar, DollarSign, Star, Clock } from 'lucide-react'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    skills: searchParams.get('skills') || '',
    budgetMin: searchParams.get('budgetMin') || '',
    budgetMax: searchParams.get('budgetMax') || '',
    page: parseInt(searchParams.get('page')) || 1
  })

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsAPI.getAll(filters)
  })

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      skills: '',
      budgetMin: '',
      budgetMax: '',
      page: 1
    })
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
        <p className="text-gray-600 mt-2">
          Discover projects that match your skills and interests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input pl-10"
                    placeholder="Job title or keywords"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  className="input"
                  placeholder="e.g., React, Node.js, Python"
                />
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                    className="input"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                    className="input"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full btn-ghost text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Job Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {jobsData?.data.data.pagination?.total || 0} Jobs Found
              </h2>
              <p className="text-gray-600 text-sm">
                Showing page {filters.page} of {jobsData?.data.data.pagination?.pages || 1}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Jobs List */}
          {!isLoading && (
            <div className="space-y-4">
              {jobsData?.data.data.jobs?.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="card p-6 block hover:border-primary-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {job.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-gray-900">
                        {formatBudget(job.budget)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDuration(job.duration)}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skillsRequired.map((skill, index) => (
                      <span key={index} className="badge badge-primary text-xs">
                        {skill}
                      </span>
                    ))}
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
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{job.clientId?.rating?.average || 'New'}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* No Results */}
              {jobsData?.data.data.jobs?.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search filters or browse all available jobs.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {jobsData?.data.data.pagination && jobsData.data.data.pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: jobsData.data.data.pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        page === filters.page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === jobsData.data.data.pagination.pages}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults