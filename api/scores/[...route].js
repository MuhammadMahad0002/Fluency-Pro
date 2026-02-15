const { connectToDatabase } = require('../lib/mongodb');
const Score = require('../lib/models/Score');
const { verifyAuth } = require('../lib/auth');
const mongoose = require('mongoose');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Verify authentication for all routes
  const auth = await verifyAuth(req);
  if (auth.error) {
    return res.status(auth.status).json({ message: auth.error });
  }

  // Parse route from URL path (more reliable than req.query.route with Vercel rewrites)
  const urlPath = req.url.split('?')[0];
  const routePath = urlPath.replace(/^\/api\/scores\/?/, '');

  try {
    await connectToDatabase();

    // POST /api/scores - Save a new score
    if (routePath === '' && req.method === 'POST') {
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
        user: auth.userId,
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

      return res.status(201).json({
        message: 'Score saved successfully',
        score: newScore
      });
    }

    // GET /api/scores/top - Get user's top 5 scores
    if (routePath === 'top' && req.method === 'GET') {
      const topScores = await Score.find({ user: auth.userId })
        .sort({ score: -1 })
        .limit(5)
        .select('-speechText');

      return res.json({ scores: topScores });
    }

    // GET /api/scores/recent - Get user's recent scores
    if (routePath === 'recent' && req.method === 'GET') {
      const recentScores = await Score.find({ user: auth.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-speechText');

      return res.json({ scores: recentScores });
    }

    // GET /api/scores/stats - Get user's score statistics
    if (routePath === 'stats' && req.method === 'GET') {
      const stats = await Score.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(auth.userId) } },
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

      return res.json({ stats: result });
    }

    // GET /api/scores/history - Get user's complete score history with pagination
    if (routePath === 'history' && req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const scores = await Score.find({ user: auth.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-speechText');

      const total = await Score.countDocuments({ user: auth.userId });

      return res.json({
        scores,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    return res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Scores API error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
