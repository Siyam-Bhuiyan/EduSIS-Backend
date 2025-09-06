const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide message subject"],
      trim: true,
      maxlength: [200, "Subject cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide message content"],
      trim: true,
      maxlength: [2000, "Content cannot be more than 2000 characters"],
    },
    messageType: {
      type: String,
      enum: ["personal", "announcement", "system", "notification"],
      default: "personal",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
      default: null,
    },
    threadId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
messageSchema.index({ sender: 1, sentAt: -1 });
messageSchema.index({ receiver: 1, sentAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ threadId: 1, sentAt: 1 });

// Virtual for reply messages
messageSchema.virtual("replies", {
  ref: "Message",
  localField: "_id",
  foreignField: "parentMessage",
  justOne: false,
});

// Pre-save middleware to generate thread ID
messageSchema.pre("save", function (next) {
  if (this.isNew && !this.parentMessage && !this.threadId) {
    this.threadId = `thread_${this._id}`;
  } else if (this.parentMessage && !this.threadId) {
    // Get thread ID from parent message
    mongoose
      .model("Message")
      .findById(this.parentMessage)
      .then((parent) => {
        this.threadId = parent.threadId || `thread_${parent._id}`;
        next();
      })
      .catch(next);
    return;
  }
  next();
});

// Method to mark as read
messageSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Method to toggle star
messageSchema.methods.toggleStar = async function () {
  this.isStarred = !this.isStarred;
  await this.save();
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    isDeleted: false,
  });
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function (
  user1Id,
  user2Id,
  limit = 50
) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
    isDeleted: false,
  })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ sentAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model("Message", messageSchema);
