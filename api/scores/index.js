const { connectToDatabase } = require('../lib/mongodb');
const Score = require('../lib/models/Score');
const { verifyAuth } = require('../lib/auth');

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

  // Only POST method allowed at root
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const auth = await verifyAuth(req);
  if (auth.error) {
    return res.status(auth.status).json({ message: auth.error });
  }

  try {
    await connectToDatabase();

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
  } catch (error) {
    console.error('Save score error:', error);
    return res.status(500).json({ message: 'Error saving score' });
  }
};
