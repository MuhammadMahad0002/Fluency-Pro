const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../lib/mongodb');
const User = require('../lib/models/User');
const { verifyAuth } = require('../lib/auth');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Check required environment variables
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ message: 'Server misconfigured: MONGODB_URI environment variable is not set' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET environment variable is not set' });
  }

  const { route } = req.query;
  const routePath = Array.isArray(route) ? route.join('/') : route;

  try {
    await connectToDatabase();

    // POST /api/auth/signup
    if (routePath === 'signup' && req.method === 'POST') {
      const { firstName, lastName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const user = new User({ firstName, lastName, email, password });
      await user.save();

      const token = generateToken(user._id);

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    }

    // POST /api/auth/login
    if (routePath === 'login' && req.method === 'POST') {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    }

    // GET /api/auth/me
    if (routePath === 'me' && req.method === 'GET') {
      const auth = await verifyAuth(req);
      if (auth.error) {
        return res.status(auth.status).json({ message: auth.error });
      }

      return res.json({
        user: {
          id: auth.user._id,
          firstName: auth.user.firstName,
          lastName: auth.user.lastName,
          email: auth.user.email
        }
      });
    }

    // GET /api/auth/verify
    if (routePath === 'verify' && req.method === 'GET') {
      const auth = await verifyAuth(req);
      if (auth.error) {
        return res.status(auth.status).json({ message: auth.error });
      }

      return res.json({ valid: true });
    }

    return res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
