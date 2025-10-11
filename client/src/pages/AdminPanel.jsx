// client/src/pages/AdminPanel.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../utils/api'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const AdminPanel = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userSearch, setUserSearch] = useState('')

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersAPI.getAll(),
    enabled: user?.isAdmin
  })

  const banUserMutation = useMutation({
    mutationFn: (userId) => usersAPI.banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    }
  })

  const unbanUserMutation = useMutation({
    mutationFn: (userId) => usersAPI.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    }
  })

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const stats = [
    { name: 'Total Users', value: '1,234', icon: Users, change: '+12%', color: 'blue' },
    { name: 'Active Jobs', value: '89', icon: Briefcase, change: '+5%', color: 'green' },
    { name: 'Revenue', value: '$45,678', icon: DollarSign, change: '+23%', color: 'purple' },
    { name: 'Growth', value: '34%', icon: TrendingUp, change: '+8%', color: 'yellow' }
  ]

  const filteredUsers = usersData?.data.data.users?.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.profile?.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.profile?.lastName?.toLowerCase().includes(userSearch.toLowerCase())
  ) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage platform users and monitor system health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'users', 'jobs', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input pl-10 w-64"
                />
              </div>
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-primary capitalize">{user.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        user.isActive 
                          ? (user.isFlagged ? 'badge-warning' : 'badge-success')
                          : 'badge-error'
                      }`}>
                        {user.isActive 
                          ? (user.isFlagged ? 'Flagged' : 'Active')
                          : 'Banned'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {user.isActive ? (
                          <button
                            onClick={() => banUserMutation.mutate(user._id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unbanUserMutation.mutate(user._id)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Unban User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New user registration</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">API Server</span>
                </div>
                <span className="badge badge-success">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="badge badge-success">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium">Payment Gateway</span>
                </div>
                <span className="badge badge-warning">Degraded</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel