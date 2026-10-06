const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  mimeType: String,

  fileSize: Number,

  pageCount: Number,

  totalCharacters: Number,

  chunkCount: {
    type: Number,
    default: 0,
  },

  metadata: {
    producer: String,
    creator: String,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Document', documentSchema);