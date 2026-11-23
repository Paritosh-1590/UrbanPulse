const User = require('../models/User');
const { verifyToken } = require('../services/security');

function createAuthMiddleware(jwtSecret) {
  return async function requireAuth(req, res, next) {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Sign in to continue.' });

    try {
      const payload = verifyToken(token, jwtSecret);
      const user = await User.findById(payload.sub).select('name email role department');
      if (!user) return res.status(401).json({ success: false, message: 'This account no longer exists.' });
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Sign in again.' });
    }
  };
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

module.exports = { createAuthMiddleware, allowRoles };
