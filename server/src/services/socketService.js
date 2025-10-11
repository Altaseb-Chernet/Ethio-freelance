// server/src/services/socketService.js
const Notification = require('../models/Notification')

module.exports = (io) => {
  io.on('connection', (socket) => {
    // console.log('User connected:', socket.id)

    // Join user to their personal room
    socket.on('join-user', (userId) => {
      socket.join(`user_${userId}`)
      console.log(`User ${userId} joined room user_${userId}`)
    })

    // Join contract room for real-time chat
    socket.on('join-contract', (contractId) => {
      socket.join(`contract_${contractId}`)
      console.log(`User joined contract room: ${contractId}`)
    })

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { contractId, senderId, receiverId, content, attachments } = data

        // Save message to database
        const Message = require('../models/Message')
        const message = new Message({
          contractId,
          senderId,
          receiverId,
          content,
          attachments
        })

        await message.save()
        await message.populate('senderId', 'profile.firstName profile.lastName profile.avatar')

        // Emit to contract room
        io.to(`contract_${contractId}`).emit('new-message', message)

        // Create and send notification
        const notification = new Notification({
          userId: receiverId,
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${message.senderId.profile.firstName}`,
          data: { contractId, messageId: message._id }
        })
        await notification.save()

        // Emit notification to receiver
        io.to(`user_${receiverId}`).emit('notification', {
          id: notification._id,
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${message.senderId.profile.firstName}`,
          data: { contractId, messageId: message._id },
          timestamp: notification.createdAt
        })

      } catch (error) {
        console.error('Socket send message error:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle bid notifications
    socket.on('new-bid', async (data) => {
      try {
        const { jobId, freelancerId, clientId, jobTitle } = data
        
        const notification = new Notification({
          userId: clientId,
          type: 'new_bid',
          title: 'New Proposal',
          message: `You have a new proposal for "${jobTitle}"`,
          data: { jobId, freelancerId }
        })
        await notification.save()

        io.to(`user_${clientId}`).emit('notification', {
          id: notification._id,
          type: 'new_bid',
          title: 'New Proposal',
          message: `You have a new proposal for "${jobTitle}"`,
          data: { jobId, freelancerId },
          timestamp: notification.createdAt
        })

      } catch (error) {
        console.error('Socket new bid error:', error)
      }
    })

    // Handle bid acceptance notifications
    socket.on('bid-accepted', async (data) => {
      try {
        const { jobId, freelancerId, clientId, jobTitle } = data
        
        const notification = new Notification({
          userId: freelancerId,
          type: 'bid_accepted',
          title: 'Proposal Accepted!',
          message: `Your proposal for "${jobTitle}" was accepted!`,
          data: { jobId, clientId }
        })
        await notification.save()

        io.to(`user_${freelancerId}`).emit('notification', {
          id: notification._id,
          type: 'bid_accepted',
          title: 'Proposal Accepted!',
          message: `Your proposal for "${jobTitle}" was accepted!`,
          data: { jobId, clientId },
          timestamp: notification.createdAt
        })

      } catch (error) {
        console.error('Socket bid accepted error:', error)
      }
    })

    // Handle payment notifications
    socket.on('payment-received', async (data) => {
      try {
        const { freelancerId, amount, jobTitle } = data
        
        const notification = new Notification({
          userId: freelancerId,
          type: 'payment_received',
          title: 'Payment Received',
          message: `You received $${amount} for "${jobTitle}"`,
          data: { amount, jobTitle }
        })
        await notification.save()

        io.to(`user_${freelancerId}`).emit('notification', {
          id: notification._id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `You received $${amount} for "${jobTitle}"`,
          data: { amount, jobTitle },
          timestamp: notification.createdAt
        })

      } catch (error) {
        console.error('Socket payment received error:', error)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      // console.log('User disconnected:', socket.id)
    })
  })
}