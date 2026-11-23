const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signToken(user, secret, ttlSeconds = 604800) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: String(user._id),
    role: user.role,
    iat: now,
    exp: now + ttlSeconds,
  }));
  const input = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(input).digest('base64url');
  return `${input}.${signature}`;
}

function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token.');
  const [headerPart, payloadPart, signature] = parts;
  const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
  if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new Error('Unsupported token.');
  const expected = crypto.createHmac('sha256', secret).update(`${headerPart}.${payloadPart}`).digest();
  const received = Buffer.from(signature, 'base64url');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) throw new Error('Invalid token signature.');
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('Token expired.');
  return payload;
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
