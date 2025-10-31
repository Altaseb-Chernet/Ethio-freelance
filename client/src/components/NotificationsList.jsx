// client/src/components/NotificationsList.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/NotificationsContext'
import { 
  Bell, 
  Check, 
  X, 
  MessageSquare, 
  DollarSign, 
  Briefcase, 
  User,
  FileText,
  Award,
  Clock,
  Settings
} from 'lucide-react'

const NotificationsList = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    isConnected 
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'new_bid':
        return <DollarSign className="w-4 h-4" />
      case 'bid_accepted':
        return <Award className="w-4 h-4" />
      case 'job_funded':
      case 'contract_started':
        return <Briefcase className="w-4 h-4" />
      case 'payment_received':
        return <DollarSign className="w-4 h-4" />
      case 'job_completed':
        return <FileText className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-100'
      case 'new_bid':
        return 'text-green-600 bg-green-100'
      case 'bid_accepted':
        return 'text-purple-600 bg-purple-100'
      case 'payment_received':
        return 'text-green-600 bg-green-100'
      case 'job_completed':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return notificationTime.toLocaleDateString()
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    
    // Handle navigation based on notification type
    if (notification.data) {
      if (notification.data.contractId) {
        // Navigate to messages for this contract
        window.location.href = `/messages`
      } else if (notification.data.jobId) {
        // Navigate to job details
        window.location.href = `/jobs/${notification.data.jobId}`
      }
    }
    
    setIsOpen(false)
  }

  const handleBellClick = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation()
    removeNotification(notificationId)
  }

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation()
    markAllAsRead()
  }

  const handleClearAll = (e) => {
    e.stopPropagation()
    notifications.forEach(n => removeNotification(n.id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection status dot */}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Live' : 'online'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(notification.timestamp)}</span>
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemoveNotification(e, notification.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        aria-label="Remove notification"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
                <p className="text-xs">We'll notify you when something arrives</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-500">
                  <span className="font-medium">{unreadCount}</span> unread •{' '}
                  <span className="font-medium">{notifications.length}</span> total
                </div>
                <button 
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsList