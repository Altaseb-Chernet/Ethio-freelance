// client/src/components/BidForm.jsx
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { bidsAPI, aiAPI } from '../utils/api'
import { Send, Sparkles, Clock, DollarSign } from 'lucide-react'

const BidForm = ({ jobId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    proposal: '',
    price: '',
    estimatedTime: { value: '', unit: 'days' }
  })
  const [enhancedProposal, setEnhancedProposal] = useState(null)

  const createBidMutation = useMutation({
    mutationFn: (data) => bidsAPI.create(jobId, data),
    onSuccess: () => {
      onSuccess?.()
      setFormData({ proposal: '', price: '', estimatedTime: { value: '', unit: 'days' } })
      setEnhancedProposal(null)
    }
  })

  const enhanceProposalMutation = useMutation({
    mutationFn: (data) => aiAPI.enhanceProposal(data),
    onSuccess: (response) => {
      setEnhancedProposal(response.data.data)
      setFormData(prev => ({ ...prev, proposal: response.data.data.enhancedProposal }))
    }
  })

  const handleEnhanceProposal = () => {
    if (formData.proposal) {
      enhanceProposalMutation.mutate({
        proposal: formData.proposal,
        jobDescription: '' // This would come from job context
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createBidMutation.mutate({
      ...formData,
      price: Number(formData.price),
      estimatedTime: {
        ...formData.estimatedTime,
        value: Number(formData.estimatedTime.value)
      }
    })
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Proposal</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Proposal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Proposal *
          </label>
          <textarea
            required
            rows={4}
            value={formData.proposal}
            onChange={(e) => setFormData(prev => ({ ...prev, proposal: e.target.value }))}
            className="input resize-none"
            placeholder="Describe why you're the best fit for this project. Include your relevant experience and approach..."
          />
          <button
            type="button"
            onClick={handleEnhanceProposal}
            disabled={!formData.proposal || enhanceProposalMutation.isLoading}
            className="mt-2 btn-secondary text-sm flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {enhanceProposalMutation.isLoading ? 'Enhancing...' : 'AI Enhance'}
            </span>
          </button>
        </div>

        {/* Enhanced Proposal Preview */}
        {enhancedProposal && (
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center space-x-2 text-primary-700 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Enhanced Proposal</span>
              <span className="text-sm bg-primary-200 px-2 py-1 rounded-full">
                {Math.round(enhancedProposal.confidenceScore * 100)}% confidence
              </span>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {enhancedProposal.enhancedProposal}
            </div>
            <div className="mt-2 text-xs text-primary-600">
              <strong>Improvements:</strong> {enhancedProposal.improvements.join(', ')}
            </div>
          </div>
        )}

        {/* Price and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Price ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input pl-10"
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time *
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  required
                  value={formData.estimatedTime.value}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedTime: { ...prev.estimatedTime, value: e.target.value }
                  }))}
                  className="input pl-10"
                  placeholder="Duration"
                  min="1"
                />
              </div>
              <select
                value={formData.estimatedTime.unit}
                onChange={(e) => setFormData(prev => ({ 
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

        {/* Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
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
            <span>
              {createBidMutation.isLoading ? 'Submitting...' : 'Submit Proposal'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default BidForm