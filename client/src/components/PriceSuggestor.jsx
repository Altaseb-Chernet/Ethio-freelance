// client/src/components/PriceSuggestor.jsx
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../utils/api'
import { Sparkles, DollarSign, TrendingUp, Info } from 'lucide-react'

const PriceSuggestor = ({ skills = [], duration = '1-2 weeks', onSuggestionApply }) => {
  const [suggestedPrice, setSuggestedPrice] = useState(null)

  const suggestPriceMutation = useMutation({
    mutationFn: (data) => aiAPI.suggestPrice(data),
    onSuccess: (response) => {
      setSuggestedPrice(response.data.data)
    }
  })

  const handleSuggestPrice = () => {
    if (skills.length > 0) {
      suggestPriceMutation.mutate({
        skillsRequired: skills,
        duration: duration,
        budget: { type: 'fixed', fixed: 0 } // Default budget
      })
    }
  }

  const handleApplySuggestion = () => {
    if (suggestedPrice) {
      onSuggestionApply?.(suggestedPrice)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Price Suggestion</h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Get AI-powered price suggestions based on market rates, required skills, and project duration.
        </p>

        <button
          onClick={handleSuggestPrice}
          disabled={skills.length === 0 || suggestPriceMutation.isLoading}
          className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {suggestPriceMutation.isLoading ? 'Analyzing...' : 'Get Price Suggestion'}
          </span>
        </button>

        {suggestedPrice && (
          <div className="space-y-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-900">Suggested Range</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-primary-600">
                <TrendingUp className="w-4 h-4" />
                <span>{suggestedPrice.confidence * 100}% confidence</span>
              </div>
            </div>

            <div className="text-center py-2">
              <div className="text-2xl font-bold text-gray-900">
                ${suggestedPrice.min} - ${suggestedPrice.max}
              </div>
              <div className="text-sm text-gray-600 mt-1">Market range for your project</div>
            </div>

            <div className="text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>{suggestedPrice.rationale}</span>
              </div>
            </div>

            <button
              onClick={handleApplySuggestion}
              className="w-full btn-primary text-sm"
            >
              Apply This Range
            </button>
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-2">
            Add skills to get price suggestions
          </div>
        )}
      </div>
    </div>
  )
}

export default PriceSuggestor