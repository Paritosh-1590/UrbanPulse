const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../services/security');
const { classifyComplaint, inferPriority, slaDays } = require('../services/classifier');
const { suggestCategory } = require('../services/ml-client');

test('password hashes verify only the original password', async () => {
  const hash = await hashPassword('A sufficiently long demo password');
  assert.equal(await verifyPassword('A sufficiently long demo password', hash), true);
  assert.equal(await verifyPassword('not the password', hash), false);
});

test('JWT contains the account subject and rejects tampering', () => {
  const secret = 'a'.repeat(48);
  const token = signToken({ _id: 'user-123', role: 'citizen' }, secret, 60);
  assert.equal(verifyToken(token, secret).sub, 'user-123');
  assert.throws(() => verifyToken(`${token.slice(0, -1)}x`, secret));
});

test('JWT rejects an expired token', () => {
  const token = signToken({ _id: 'user-123', role: 'citizen' }, 'b'.repeat(48), -1);
  assert.throws(() => verifyToken(token, 'b'.repeat(48)), /expired/i);
});

test('keyword fallback suggests a civic issue category', () => {
  assert.equal(classifyComplaint('A pothole has opened on the main road').category, 'Roads');
  assert.equal(classifyComplaint('Garbage collection was missed this week').category, 'Sanitation');
  assert.equal(classifyComplaint('The streetlight is not working at night').category, 'Electricity');
});

test('priority and SLA rules are deterministic', () => {
  assert.equal(inferPriority('An exposed wire is hanging near the school'), 'High');
  assert.equal(slaDays('Water', 'High'), 1);
  assert.equal(slaDays('Roads', 'Low'), 5);
});

test('ML client falls back to local keyword classification when no service is configured', async () => {
  const result = await suggestCategory('A pothole has damaged the main road', null);
  assert.equal(result.category, 'Roads');
  assert.equal(result.source, 'keyword-fallback');
});
