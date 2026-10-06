const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    sources: [
      {
        documentId: String,
        documentName: String,
        chunkIndex: Number,
        similarity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Message',
  messageSchema
);