const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['citizen', 'admin', 'department_official'], default: 'citizen', required: true },
  department: { type: String, trim: true, default: null },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
