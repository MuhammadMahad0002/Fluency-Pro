const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { connectToDatabase } = require('./mongodb');

const verifyAuth = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token, authorization denied', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user, userId: decoded.userId };
  } catch (error) {
    return { error: 'Token is not valid', status: 401 };
  }
};

module.exports = { verifyAuth };
