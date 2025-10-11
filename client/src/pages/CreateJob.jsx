// client/src/pages/CreateJob.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsAPI, aiAPI } from '../utils/api'
import { ArrowLeft, Sparkles, DollarSign, Calendar, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

const CreateJob = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: [],
    budget: {
      type: 'fixed',
      fixed: '',
      min: '',
      max: ''
    },
    duration: '1-2 weeks'
  })
  const [currentSkill, setCurrentSkill] = useState('')
  const [suggestedPrice, setSuggestedPrice] = useState(null)

  const createJobMutation = useMutation({
    mutationFn: (data) => jobsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs'])
      navigate('/dashboard')
    }
  })

  const suggestPriceMutation = useMutation({
    mutationFn: (data) => aiAPI.suggestPrice(data),
    onSuccess: (response) => {
      setSuggestedPrice(response.data.data)
    }
  })

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSuggestPrice = () => {
    if (formData.skillsRequired.length > 0 && formData.description) {
      suggestPriceMutation.mutate({
        skillsRequired: formData.skillsRequired,
        duration: formData.duration,
        budget: formData.budget
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      budget: {
        ...formData.budget,
        fixed: formData.budget.type === 'fixed' ? Number(formData.budget.fixed) : undefined,
        min: formData.budget.type === 'hourly' ? Number(formData.budget.min) : undefined,
        max: formData.budget.type === 'hourly' ? Number(formData.budget.max) : undefined
      }
    }

    createJobMutation.mutate(submitData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-2">Fill in the details to find the perfect freelancer for your project.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-8">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="input"
            placeholder="e.g., Build a React E-commerce Website"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input resize-none"
            placeholder="Describe your project in detail. What needs to be done? What are the requirements?"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills *
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.skillsRequired.map((skill, index) => (
              <span key={index} className="badge badge-primary flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="input flex-1"
              placeholder="Add a skill (e.g., React, Node.js, UI/UX)"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-secondary whitespace-nowrap"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Budget *
          </label>
          
          {/* Budget Type */}
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                checked={formData.budget.type === 'fixed'}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  budget: { ...prev.budget, type: 'fixed' }
                }))}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Fixed Price</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                checked={formData.budget.type === 'hourly'}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  budget: { ...prev.budget, type: 'hourly' }
                }))}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hourly Rate</span>
            </label>
          </div>

          {/* Budget Input */}
          <div className="flex items-center space-x-4">
            {formData.budget.type === 'fixed' ? (
              <div className="flex items-center space-x-2 flex-1">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  required
                  value={formData.budget.fixed}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budget: { ...prev.budget, fixed: e.target.value }
                  }))}
                  className="input"
                  placeholder="Enter fixed budget"
                  min="1"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-2 flex-1">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    value={formData.budget.min}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, min: e.target.value }
                    }))}
                    className="input"
                    placeholder="Min rate"
                    min="1"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex items-center space-x-2 flex-1">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    value={formData.budget.max}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, max: e.target.value }
                    }))}
                    className="input"
                    placeholder="Max rate"
                    min="1"
                  />
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSuggestPrice}
              disabled={!formData.skillsRequired.length || !formData.description}
              className="btn-secondary flex items-center space-x-2 whitespace-nowrap disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Suggest</span>
            </button>
          </div>

          {/* AI Price Suggestion */}
          {suggestedPrice && (
            <div className="mt-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center space-x-2 text-primary-700 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI Price Suggestion</span>
              </div>
              <p className="text-sm text-primary-600 mb-2">
                Based on market rates and project complexity, we suggest:
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium">${suggestedPrice.min} - ${suggestedPrice.max}</span>
                <span className="text-primary-500">•</span>
                <span className="text-primary-600">{suggestedPrice.rationale}</span>
              </div>
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Project Duration *
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              id="duration"
              required
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="input"
            >
              <option value="less-than-week">Less than 1 week</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="2-4 weeks">2-4 weeks</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3+ months">3+ months</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <Link to="/dashboard" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createJobMutation.isLoading}
            className="btn-primary flex-1 py-3"
          >
            {createJobMutation.isLoading ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateJob