const mongoose = require('mongoose');
const { validateEnv } = require('../config/env');
const User = require('../models/User');
const { hashPassword } = require('../services/security');

async function main() {
  const config = validateEnv();
  const name = String(process.env.ADMIN_NAME || '').trim();
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in server/.env before running this script.');
  }

  await mongoose.connect(config.mongoUri);
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') throw new Error('That email already belongs to a non-admin account. Use a different email.');
    console.log(`An administrator account already exists for ${email}; no changes made.`);
    return;
  }
  await User.create({ name, email, passwordHash: await hashPassword(password), role: 'admin' });
  console.log(`Administrator account created for ${email}.`);
}

main().catch((error) => {
  console.error(`Admin setup failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
});
