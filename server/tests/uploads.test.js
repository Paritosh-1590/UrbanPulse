const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  detectImageType,
  normalizeDisplayName,
  validateFiles,
} = require('../services/complaint-images');

test('image signatures detect supported formats and reject unknown data', () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(detectImageType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')])), 'image/webp');
  assert.equal(detectImageType(Buffer.from('<html>fake</html>')), null);
});

test('upload validation rejects spoofed and oversized files', () => {
  assert.throws(
    () => validateFiles([{ originalname: 'fake.png', mimetype: 'image/png', size: 20, buffer: Buffer.from('<html>not an image</html>') }]),
    /JPEG, PNG and WebP/,
  );
  assert.throws(
    () => validateFiles([{ originalname: 'large.jpg', mimetype: 'image/jpeg', size: 5 * 1024 * 1024 + 1, buffer: Buffer.from([0xff, 0xd8, 0xff]) }]),
    /5 MB/,
  );
});

test('display names are basename-safe and normalized', () => {
  assert.doesNotMatch(normalizeDisplayName('../../private\\ evidence.jpg'), /[/\\]/);
  assert.equal(normalizeDisplayName('bad\r\nname.png'), 'badname.png');
  assert.equal(normalizeDisplayName(''), 'evidence-image');
});
