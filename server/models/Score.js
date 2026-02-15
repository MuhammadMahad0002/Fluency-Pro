const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    enum: ['2-minute', '5-minute', '10-minute'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  wordsMatched: {
    type: Number,
    required: true
  },
  totalWords: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  expectedTime: {
    type: Number, // in seconds
    required: true
  },
  accuracy: {
    type: Number, // percentage
    required: true
  },
  speechText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
scoreSchema.index({ user: 1, createdAt: -1 });
scoreSchema.index({ user: 1, score: -1 });

module.exports = mongoose.model('Score', scoreSchema);
