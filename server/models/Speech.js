const mongoose = require('mongoose');

const speechSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    index: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['2-minute', '5-minute', '10-minute'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  variantIndex: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
speechSchema.index({ topic: 1, duration: 1 });

// Static method to get random speech for a topic and duration
speechSchema.statics.getRandomSpeech = async function(topic, duration) {
  const speeches = await this.find({ topic, duration });
  
  if (speeches.length === 0) {
    return null;
  }
  
  // Generate random index
  const randomIndex = Math.floor(Math.random() * speeches.length);
  return speeches[randomIndex];
};

// Static method to get all speeches for a topic and duration
speechSchema.statics.getSpeechesByTopicAndDuration = async function(topic, duration) {
  return await this.find({ topic, duration }).sort({ variantIndex: 1 });
};

// Static method to get all unique topics
speechSchema.statics.getAllTopics = async function() {
  return await this.distinct('topic');
};

module.exports = mongoose.model('Speech', speechSchema);
