// server/src/controllers/chatController.js
const Message = require('../models/Message');
const Contract = require('../models/Contract');

const getMessages = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Verify user has access to this contract
    const contract = await Contract.findById(contractId);
    if (!contract || 
        (contract.clientId.toString() !== req.user._id.toString() && 
         contract.freelancerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to these messages'
      });
    }

    const messages = await Message.find({ contractId })
      .populate('senderId', 'profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        contractId, 
        receiverId: req.user._id,
        read: false 
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { content, attachments = [] } = req.body;

    // Verify user has access to this contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.clientId.toString() !== req.user._id.toString() && 
        contract.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this contract'
      });
    }

    // Determine receiver
    const receiverId = contract.clientId.toString() === req.user._id.toString() 
      ? contract.freelancerId 
      : contract.clientId;

    const message = new Message({
      contractId,
      senderId: req.user._id,
      receiverId,
      content,
      attachments
    });

    await message.save();
    await message.populate('senderId', 'profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

const getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [
        { clientId: req.user._id },
        { freelancerId: req.user._id }
      ],
      status: 'active'
    })
    .populate('clientId', 'profile.firstName profile.lastName profile.avatar')
    .populate('freelancerId', 'profile.firstName profile.lastName profile.avatar')
    .populate('jobId', 'title');

    res.json({
      success: true,
      data: { contracts }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getContracts
};