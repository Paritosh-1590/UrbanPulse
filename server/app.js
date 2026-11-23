const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { createAuthMiddleware, allowRoles } = require('./middleware/auth');
const createAuthRouter = require('./routes/auth');
const createComplaintsRouter = require('./routes/complaints');
const createAdminRouter = require('./routes/admin');
const createAiRouter = require('./routes/ai');

function createApp(config) {
  const app = express();
  const requireAuth = createAuthMiddleware(config.jwtSecret);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (!origin) return next();
    if (config.clientOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      return next();
    }
    return res.status(403).json({ success: false, message: 'This origin is not allowed by the API.' });
  });
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {};
    next();
  });

  const authAttempts = new Map();
  app.use(['/api/auth/login', '/api/auth/register'], (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const entry = authAttempts.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    if (entry.resetAt <= now) { entry.count = 0; entry.resetAt = now + 15 * 60 * 1000; }
    entry.count += 1;
    authAttempts.set(key, entry);
    if (entry.count > 30) return res.status(429).json({ success: false, message: 'Too many authentication requests. Try again in 15 minutes.' });
    if (authAttempts.size > 5000) {
      for (const [storedKey, value] of authAttempts) if (value.resetAt <= now) authAttempts.delete(storedKey);
    }
    return next();
  });

  app.get('/api/health', (req, res) => res.status(200).json({
    success: true,
    message: 'UrbanPulse API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  }));
  app.use('/api/auth', createAuthRouter(config, requireAuth));
  app.use('/api/ai', requireAuth, allowRoles('citizen'), createAiRouter(config));
  app.use('/api/complaints', requireAuth, createComplaintsRouter(config));
  app.use('/api/admin', requireAuth, allowRoles('admin', 'department_official'), createAdminRouter());

  app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error && error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 5 MB or smaller.'
        : error.code === 'LIMIT_FILE_COUNT'
          ? 'A complaint may include at most 3 images.'
          : 'The upload request is invalid.';
      return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message });
    }
    if (error && error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    if (error && error.statusCode === 413) return res.status(413).json({ success: false, message: error.message });
    if (error && error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.' });
    if (error && error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((item) => item.message).join(' ');
      return res.status(400).json({ success: false, message });
    }
    if (error && error.code === 11000) return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
    console.error('[UrbanPulse API]', error);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
  });

  return app;
}

module.exports = { createApp };
