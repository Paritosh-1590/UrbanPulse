const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function detectImageType(buffer) {
  if (!buffer || buffer.length < 3) return null;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8
    && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
    && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function normalizeDisplayName(originalName) {
  const baseName = path.basename(String(originalName || 'evidence-image')).replace(/[\r\n\u0000]/g, '').trim();
  return (baseName || 'evidence-image').slice(0, 180);
}

function extensionForMime(mimeType) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return null;
}

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  if (files.length > MAX_FILES) throw Object.assign(new Error('A complaint may include at most 3 images.'), { statusCode: 400 });

  return files.map((file) => {
    if (!file || file.size > MAX_FILE_SIZE) throw Object.assign(new Error('Each image must be 5 MB or smaller.'), { statusCode: 413 });
    const detectedType = detectImageType(file.buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
      throw Object.assign(new Error('Only JPEG, PNG and WebP image files are accepted.'), { statusCode: 400 });
    }
    if (file.mimetype && file.mimetype !== detectedType) {
      throw Object.assign(new Error('The uploaded file does not match a supported image type.'), { statusCode: 400 });
    }
    return {
      id: randomUUID(),
      mimeType: detectedType,
      size: file.size,
      displayName: normalizeDisplayName(file.originalname),
    };
  });
}

async function writeValidatedFiles(files, validated, uploadDir) {
  await fs.mkdir(uploadDir, { recursive: true });
  const written = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      const info = validated[index];
      const storageKey = `${info.id}${extensionForMime(info.mimeType)}`;
      await fs.writeFile(path.join(uploadDir, storageKey), files[index].buffer, { flag: 'wx', mode: 0o600 });
      written.push({ ...info, storageKey, uploadedAt: new Date() });
    }
    return written;
  } catch (error) {
    await removeFiles(written, uploadDir);
    throw error;
  }
}

async function removeFiles(images, uploadDir) {
  await Promise.all((images || []).map(async (image) => {
    const safeKey = path.basename(String(image.storageKey || ''));
    if (!safeKey) return;
    await fs.unlink(path.join(uploadDir, safeKey)).catch((error) => {
      if (error.code !== 'ENOENT') console.error('[UrbanPulse upload cleanup]', error);
    });
  }));
}

module.exports = {
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_MIME_TYPES,
  detectImageType,
  normalizeDisplayName,
  validateFiles,
  writeValidatedFiles,
  removeFiles,
};
