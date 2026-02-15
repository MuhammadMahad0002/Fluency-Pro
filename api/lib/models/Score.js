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
    type: Number,
    required: true
  },
  expectedTime: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
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

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema);
