const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Login required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'store_rating_secret_123');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  };
}

module.exports = { auth, role };
