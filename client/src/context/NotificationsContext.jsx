// client/src/context/NotificationsContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'

const NotificationsContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket, isConnected } = useSocket()

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotifications(parsed)
      setUnreadCount(parsed.filter(n => !n.read).length)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return

    const handleNotification = (notification) => {
      const newNotification = {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      }
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket])

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    isConnected
  }

// useEffect(() => {
//   // Add some demo notifications if none exist (for testing)
//   if (notifications.length === 0) {
//     const demoNotifications = [
//       {
//         id: 'demo-1',
//         type: 'message',
//         title: 'New Message',
//         message: 'John Smith sent you a message about your project',
//         timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
//         read: false,
//         data: { contractId: '123' }
//       },
//       {
//         id: 'demo-2',
//         type: 'new_bid',
//         title: 'New Proposal',
//         message: 'Sarah Johnson submitted a proposal for your React project',
//         timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
//         read: false,
//         data: { jobId: '456' }
//       },
//       {
//         id: 'demo-3', 
//         type: 'bid_accepted',
//         title: 'Proposal Accepted!',
//         message: 'Your proposal for "E-commerce Website" was accepted!',
//         timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
//         read: true,
//         data: { jobId: '789' }
//       }
//     ]
//     setNotifications(demoNotifications)
//   }
// }, [])


  return (
    <NotificationsContext.Provider value={value}>
      {children}
      
    </NotificationsContext.Provider>
  )
}