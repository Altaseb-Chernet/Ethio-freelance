// client/src/hooks/useSocket.js
import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    if (token && !socketRef.current) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      })

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id)
        setIsConnected(true)
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      setSocket(socketRef.current)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [])

  // Join user's personal room
  const joinUserRoom = (userId) => {
    if (socket && isConnected) {
      socket.emit('join-user', userId)
      console.log('Joined user room:', userId)
    }
  }

  // Join contract room for messaging
  const joinContractRoom = (contractId) => {
    if (socket && isConnected) {
      socket.emit('join-contract', contractId)
      console.log('Joined contract room:', contractId)
    }
  }

  // Send a message
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send-message', messageData)
    } else {
      console.warn('Socket not connected, message not sent')
    }
  }

  // Typing indicators
  const startTyping = (data) => {
    if (socket && isConnected) {
      socket.emit('typing-start', data)
    }
  }

  const stopTyping = (data) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', data)
    }
  }

  // Mark message as read
  const markAsRead = (data) => {
    if (socket && isConnected) {
      socket.emit('mark-read', data)
    }
  }

  return {
    socket,
    isConnected,
    joinUserRoom,
    joinContractRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  }
}