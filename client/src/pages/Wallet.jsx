// client/src/pages/Wallet.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  TrendingUp,
  Shield,
  Download,
  Plus
} from 'lucide-react'

const Wallet = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [fundAmount, setFundAmount] = useState('')

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => paymentsAPI.getWallet()
  })

  const fundJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => paymentsAPI.fundJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['wallet'])
      setShowAddFunds(false)
      setFundAmount('')
    }
  })

  const wallet = walletData?.data.data.wallet
  const transactions = walletData?.data.data.recentTransactions || []

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'withdrawal':
      case 'escrow_hold':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      case 'fee':
        return <DollarSign className="w-5 h-5 text-yellow-600" />
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return 'text-green-600'
      case 'withdrawal':
      case 'escrow_hold':
        return 'text-red-600'
      case 'fee':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTransactionType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your funds and track transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Card */}
          <div className="card p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Available Balance</h2>
                <p className="text-primary-100">Your current spendable amount</p>
              </div>
              <Shield className="w-8 h-8 text-primary-200" />
            </div>
            <div className="text-4xl font-bold mb-2">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center space-x-4 text-sm text-primary-200">
              <div>Total Earned: ${wallet?.totalEarned?.toFixed(2) || '0.00'}</div>
              <div>Total Spent: ${wallet?.totalSpent?.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setShowAddFunds(true)}
              className="card p-6 text-left hover:border-primary-300 transition-all group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Funds</h3>
              <p className="text-sm text-gray-600">Deposit money to your wallet</p>
            </button>

            <button className="card p-6 text-left hover:border-primary-300 transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Withdraw</h3>
              <p className="text-sm text-gray-600">Transfer funds to your bank</p>
            </button>
          </div>

          {/* Add Funds Modal */}
          {showAddFunds && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="card p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Funds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="input pl-10"
                        placeholder="0.00"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowAddFunds(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would integrate with payment gateway
                        console.log('Add funds:', fundAmount)
                        setShowAddFunds(false)
                      }}
                      className="btn-primary flex-1"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatTransactionType(transaction.type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Credit Card</span>
                </div>
                <span className="text-xs text-gray-500">•••• 4242</span>
              </div>
              <button className="w-full btn-ghost text-sm text-primary-600">
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2FA Enabled</span>
                <div className="w-8 h-4 bg-primary-600 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verification</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Having issues with payments or transactions?
            </p>
            <button className="w-full btn-secondary text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet