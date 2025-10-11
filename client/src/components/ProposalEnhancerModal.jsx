// client/src/components/ProposalEnhancerModal.jsx
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../utils/api'
import { Sparkles, X, Copy, CheckCircle } from 'lucide-react'

const ProposalEnhancerModal = ({ isOpen, onClose, initialProposal = '', jobDescription = '', onApply }) => {
  const [proposal, setProposal] = useState(initialProposal)
  const [copied, setCopied] = useState(false)

  const enhanceMutation = useMutation({
    mutationFn: (data) => aiAPI.enhanceProposal(data)
  })

  const handleEnhance = () => {
    if (proposal.trim()) {
      enhanceMutation.mutate({
        proposal: proposal,
        jobDescription: jobDescription
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(enhanceMutation.data?.data.data.enhancedProposal || proposal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApply = () => {
    onApply?.(enhanceMutation.data?.data.data.enhancedProposal || proposal)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Proposal Enhancer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Input Section */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Original Proposal
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={12}
              className="input resize-none flex-1"
              placeholder="Enter your proposal text here..."
            />
            <button
              onClick={handleEnhance}
              disabled={!proposal.trim() || enhanceMutation.isLoading}
              className="btn-primary mt-4 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {enhanceMutation.isLoading ? 'Enhancing...' : 'Enhance with AI'}
              </span>
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Enhanced Proposal
              </label>
              {enhanceMutation.data && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 flex-1 overflow-y-auto bg-gray-50">
              {enhanceMutation.data ? (
                <div className="space-y-4">
                  {/* Confidence Score */}
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-700">Confidence:</span>
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                      {Math.round(enhanceMutation.data.data.data.confidenceScore * 100)}%
                    </span>
                  </div>

                  {/* Enhanced Proposal */}
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {enhanceMutation.data.data.data.enhancedProposal}
                    </pre>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm mb-2">Improvements Made:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {enhanceMutation.data.data.data.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 h-full flex items-center justify-center">
                  <div>
                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p>Your enhanced proposal will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {enhanceMutation.data && (
              <button
                onClick={handleApply}
                className="btn-primary mt-4"
              >
                Apply Enhanced Proposal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalEnhancerModal