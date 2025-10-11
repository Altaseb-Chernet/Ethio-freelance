// client/src/components/ContractActions.jsx
import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsAPI } from '../utils/api'
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const ContractActions = ({ contract, job, currentUser }) => {
  const queryClient = useQueryClient()

  const releaseFundsMutation = useMutation({
    mutationFn: (jobId) => paymentsAPI.releaseFunds(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts'])
      queryClient.invalidateQueries(['wallet'])
    }
  })

  const fundJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => paymentsAPI.fundJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts'])
      queryClient.invalidateQueries(['wallet'])
    }
  })

  const isClient = currentUser.role === 'client'
  const isFreelancer = currentUser.role === 'freelancer'

  if (!job) return null

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Actions</h3>
      
      {/* Escrow Status */}
      <div className="mb-4 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">Escrow Status</span>
          <span className={`badge ${
            job.escrow.funded ? 'badge-success' : 'badge-warning'
          }`}>
            {job.escrow.funded ? 'Funded' : 'Not Funded'}
          </span>
        </div>
        {job.escrow.funded ? (
          <p className="text-sm text-gray-600">
            ${job.escrow.amount} secured in escrow
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Funds not yet secured
          </p>
        )}
      </div>

      {/* Client Actions */}
      {isClient && (
        <div className="space-y-3">
          {!job.escrow.funded && (
            <button
              onClick={() => {
                const amount = job.budget.fixed || job.budget.max
                fundJobMutation.mutate({
                  jobId: job._id,
                  data: {
                    amount: amount,
                    paymentMethod: { type: 'mock' }
                  }
                })
              }}
              className="w-full btn-primary flex items-center justify-center space-x-2"
              disabled={fundJobMutation.isLoading}
            >
              <DollarSign className="w-4 h-4" />
              <span>Fund Escrow (${job.budget.fixed || job.budget.max})</span>
            </button>
          )}

          {job.escrow.funded && !job.escrow.released && (
            <button
              onClick={() => {
                if (window.confirm('Release payment to freelancer? This action cannot be undone.')) {
                  releaseFundsMutation.mutate(job._id)
                }
              }}
              className="w-full btn-success flex items-center justify-center space-x-2"
              disabled={releaseFundsMutation.isLoading}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Release Payment</span>
            </button>
          )}

          {job.escrow.released && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Payment Released</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Freelancer Status */}
      {isFreelancer && (
        <div className="space-y-2">
          {!job.escrow.funded && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Waiting for client to fund escrow</span>
            </div>
          )}

          {job.escrow.funded && !job.escrow.released && (
            <div className="flex items-center space-x-2 text-blue-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Payment secured in escrow</span>
            </div>
          )}

          {job.escrow.released && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Payment received</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContractActions