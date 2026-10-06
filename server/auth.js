const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'duoalpha-ultra-secret-key-2026-trade-together';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' } // user remains logged in
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied - No Authentication Token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access Denied - Invalid or Expired Token' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken
};
