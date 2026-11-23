const express = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword, signToken } = require('../services/security');

function createAuthRouter(config, requireAuth) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: 'citizen' });
    const token = signToken(user, config.jwtSecret, config.tokenTtlSeconds);
    return res.status(201).json({
      success: true,
      data: { token, user: { id: String(user._id), name: user.name, email: user.email, role: user.role, department: user.department } },
    });
  });

  router.post('/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
    }

    const token = signToken(user, config.jwtSecret, config.tokenTtlSeconds);
    return res.json({
      success: true,
      data: { token, user: { id: String(user._id), name: user.name, email: user.email, role: user.role, department: user.department } },
    });
  });

  router.get('/me', requireAuth, (req, res) => {
    const { _id, name, email, role, department } = req.user;
    return res.json({ success: true, data: { user: { id: String(_id), name, email, role, department } } });
  });

  return router;
}

module.exports = createAuthRouter;
