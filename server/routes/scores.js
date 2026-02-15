const express = require('express');
const Score = require('../models/Score');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/scores
// @desc    Save a new score
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      topic,
      duration,
      score,
      wordsMatched,
      totalWords,
      timeTaken,
      expectedTime,
      accuracy,
      speechText
    } = req.body;

    const newScore = new Score({
      user: req.userId,
      topic,
      duration,
      score,
      wordsMatched,
      totalWords,
      timeTaken,
      expectedTime,
      accuracy,
      speechText
    });

    await newScore.save();

    res.status(201).json({
      message: 'Score saved successfully',
      score: newScore
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ message: 'Error saving score' });
  }
});

// @route   GET /api/scores/top
// @desc    Get user's top 5 scores
// @access  Private
router.get('/top', auth, async (req, res) => {
  try {
    const topScores = await Score.find({ user: req.userId })
      .sort({ score: -1 })
      .limit(5)
      .select('-speechText');

    res.json({ scores: topScores });
  } catch (error) {
    console.error('Get top scores error:', error);
    res.status(500).json({ message: 'Error fetching top scores' });
  }
});

// @route   GET /api/scores/recent
// @desc    Get user's recent scores
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const recentScores = await Score.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-speechText');

    res.json({ scores: recentScores });
  } catch (error) {
    console.error('Get recent scores error:', error);
    res.status(500).json({ message: 'Error fetching recent scores' });
  }
});

// @route   GET /api/scores/stats
// @desc    Get user's score statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Score.aggregate([
      { $match: { user: req.userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$accuracy' },
          highestScore: { $max: '$score' },
          totalWordsMatched: { $sum: '$wordsMatched' },
          totalTimePracticed: { $sum: '$timeTaken' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      averageScore: 0,
      averageAccuracy: 0,
      highestScore: 0,
      totalWordsMatched: 0,
      totalTimePracticed: 0
    };

    res.json({ stats: result });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// @route   GET /api/scores/history
// @desc    Get user's complete score history with pagination
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scores = await Score.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-speechText');

    const total = await Score.countDocuments({ user: req.userId });

    res.json({
      scores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Error fetching score history' });
  }
});

module.exports = router;
