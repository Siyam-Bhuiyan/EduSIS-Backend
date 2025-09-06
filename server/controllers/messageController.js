const { asyncHandler } = require("../middleware/error");
const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get user messages
// @route   GET /api/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Build query based on folder
  let query = { receiver: req.user._id };

  if (req.query.folder === "sent") {
    query = { sender: req.user._id };
  } else if (req.query.folder === "starred") {
    query = { receiver: req.user._id, isStarred: true };
  } else if (req.query.folder === "archived") {
    query = { receiver: req.user._id, isArchived: true };
  } else {
    // Inbox - exclude archived and deleted
    query = {
      receiver: req.user._id,
      isArchived: false,
      isDeleted: false,
    };
  }

  // Add filters
  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === "true";
  }
  if (req.query.messageType) {
    query.messageType = req.query.messageType;
  }
  if (req.query.priority) {
    query.priority = req.query.priority;
  }

  const messages = await Message.find(query)
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ sentAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Message.countDocuments(query);
  const unreadCount = await Message.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    unreadCount,
    data: messages,
  });
});

// @desc    Get message by ID
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .populate("replies");

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  // Check if user is sender or receiver
  if (
    message.sender._id.toString() !== req.user._id.toString() &&
    message.receiver._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this message",
    });
  }

  // Mark as read if user is receiver
  if (message.receiver._id.toString() === req.user._id.toString()) {
    await message.markAsRead();
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const {
    receiverId,
    subject,
    content,
    messageType,
    priority,
    parentMessageId,
  } = req.body;

  // Verify receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({
      success: false,
      message: "Receiver not found",
    });
  }

  const messageData = {
    sender: req.user._id,
    receiver: receiverId,
    subject,
    content,
    messageType: messageType || "personal",
    priority: priority || "normal",
  };

  // Handle reply
  if (parentMessageId) {
    const parentMessage = await Message.findById(parentMessageId);
    if (parentMessage) {
      messageData.parentMessage = parentMessageId;
      messageData.threadId = parentMessage.threadId;
    }
  }

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    messageData.attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    }));
  }

  const message = await Message.create(messageData);

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email role")
    .populate("receiver", "name email role");

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  // Check if user is receiver
  if (message.receiver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to modify this message",
    });
  }

  await message.markAsRead();

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Toggle star on message
// @route   PUT /api/messages/:id/star
// @access  Private
exports.toggleStar = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  // Check if user is receiver or sender
  if (
    message.receiver.toString() !== req.user._id.toString() &&
    message.sender.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to modify this message",
    });
  }

  await message.toggleStar();

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Archive message
// @route   PUT /api/messages/:id/archive
// @access  Private
exports.archiveMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  // Check if user is receiver
  if (message.receiver.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to modify this message",
    });
  }

  message.isArchived = !message.isArchived;
  await message.save();

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Message not found",
    });
  }

  // Check if user is receiver or sender
  if (
    message.receiver.toString() !== req.user._id.toString() &&
    message.sender.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this message",
    });
  }

  message.isDeleted = true;
  await message.save();

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 50;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const messages = await Message.getConversation(req.user._id, userId, limit);

  res.status(200).json({
    success: true,
    data: messages,
  });
});

// @desc    Get message statistics
// @route   GET /api/messages/stats
// @access  Private
exports.getMessageStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const stats = await Promise.all([
    Message.countDocuments({ receiver: userId, isDeleted: false }),
    Message.countDocuments({
      receiver: userId,
      isRead: false,
      isDeleted: false,
    }),
    Message.countDocuments({ sender: userId }),
    Message.countDocuments({
      receiver: userId,
      isStarred: true,
      isDeleted: false,
    }),
    Message.countDocuments({
      receiver: userId,
      isArchived: true,
      isDeleted: false,
    }),
  ]);

  const [total, unread, sent, starred, archived] = stats;

  res.status(200).json({
    success: true,
    data: {
      total,
      unread,
      sent,
      starred,
      archived,
    },
  });
});
