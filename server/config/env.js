const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function validateEnv() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy server/.env.example to server/.env and fill it in.`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }

  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const tokenTtlSeconds = Number(process.env.JWT_TTL_SECONDS || 60 * 60 * 24 * 7);
  if (!Number.isInteger(tokenTtlSeconds) || tokenTtlSeconds < 60) throw new Error('JWT_TTL_SECONDS must be an integer of at least 60 seconds.');

  return {
    port,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    tokenTtlSeconds,
    clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((value) => value.trim()).filter(Boolean),
    mlServiceUrl: (process.env.ML_SERVICE_URL || '').replace(/\/$/, ''),
    uploadDir: path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/complaints'),
  };
}

module.exports = { validateEnv };
