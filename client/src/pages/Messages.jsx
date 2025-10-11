// client/src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatAPI } from '../utils/api'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../context/AuthContext'
import { Search, Send, Paperclip, Image, File, Users } from 'lucide-react'

const Messages = () => {
  const [selectedContract, setSelectedContract] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const messagesEndRef = useRef(null)

  const { user } = useAuth()
  const { socket, isConnected, joinContractRoom, sendMessage } = useSocket()
  const queryClient = useQueryClient()

  const { data: contractsData } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => chatAPI.getContracts()
  })

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedContract?._id],
    queryFn: () => chatAPI.getMessages(selectedContract?._id),
    enabled: !!selectedContract
  })

  const sendMessageMutation = useMutation({
    mutationFn: (data) => chatAPI.sendMessage(selectedContract?._id, data),
    onSuccess: () => {
      setNewMessage('')
      setAttachments([])
      refetchMessages()
    }
  })

  const contracts = contractsData?.data.data.contracts || []
  const messages = messagesData?.data.data.messages || []

  // Join contract room when selected
  useEffect(() => {
    if (selectedContract && socket) {
      joinContractRoom(selectedContract._id)
    }
  }, [selectedContract, socket, joinContractRoom])

  // Listen for new messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      console.log('New message received:', message)
      if (message.contractId === selectedContract?._id) {
        queryClient.invalidateQueries(['messages', selectedContract._id])
      }
    }

    const handleNotification = (notification) => {
      console.log('Notification received:', notification)
      // You can add notification handling logic here
    }

    socket.on('new-message', handleNewMessage)
    socket.on('notification', handleNotification)

    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('notification', handleNotification)
    }
  }, [socket, selectedContract, queryClient])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() && attachments.length === 0) return

    const messageData = {
      content: newMessage.trim(),
      attachments
    }

    if (socket && isConnected) {
      // Send via socket for real-time
      sendMessage({
        contractId: selectedContract._id,
        senderId: user._id,
        receiverId: getOtherUser(selectedContract)._id,
        ...messageData
      })
      setNewMessage('')
      setAttachments([])
    } else {
      // Fallback to HTTP
      sendMessageMutation.mutate(messageData)
    }
  }

  const getOtherUser = (contract) => {
    return contract.clientId._id === user._id ? contract.freelancerId : contract.clientId
  }

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contracts.map((contract) => {
                const otherUser = getOtherUser(contract)
                return (
                  <button
                    key={contract._id}
                    onClick={() => setSelectedContract(contract)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedContract?._id === contract._id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {otherUser.profile.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {otherUser.profile.firstName} {otherUser.profile.lastName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {contract.jobId?.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            contract.status === 'active' ? 'bg-green-100 text-green-700' :
                            contract.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {contract.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            ${contract.terms?.price || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}

              {contracts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active conversations</p>
                  <p className="text-sm mt-2">Start a conversation by accepting a bid</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {selectedContract ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {getOtherUser(selectedContract).profile.firstName?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {getOtherUser(selectedContract).profile.firstName} {getOtherUser(selectedContract).profile.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedContract.jobId?.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedContract.status === 'active' ? 'bg-green-100 text-green-700' :
                          selectedContract.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedContract.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${selectedContract.terms?.price || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-500">
                        {isConnected ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.senderId._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                          message.senderId._id === user._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-xs opacity-80"
                              >
                                <File className="w-3 h-3" />
                                <span>{attachment.filename}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-1 ${
                          message.senderId._id === user._id ? 'text-primary-200' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                          {message.read && message.senderId._id === user._id && (
                            <span className="ml-2">✓ Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />

                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="input"
                        disabled={!isConnected && sendMessageMutation.isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sendMessageMutation.isLoading || (!newMessage.trim() && attachments.length === 0) || !isConnected}
                      className="btn-primary disabled:opacity-50"
                      title={!isConnected ? "Not connected to server" : "Send message"}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  {!isConnected && (
                    <p className="text-xs text-red-500 mt-2">
                      Connection lost. Messages may not be delivered in real-time.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages