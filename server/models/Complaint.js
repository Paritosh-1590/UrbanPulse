const mongoose = require('mongoose');

const { CATEGORIES, STATUSES, DEPARTMENTS } = require('../constants');

const historySchema = new mongoose.Schema({
  action: { type: String, required: true, maxlength: 80 },
  note: { type: String, default: '', maxlength: 500 },
  status: { type: String, enum: STATUSES, default: null },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  changedByName: { type: String, default: 'System', maxlength: 80 },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  category: { type: String, enum: CATEGORIES, required: true },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  imageUrl: { type: String, default: null, maxlength: 500 },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedDepartment: { type: String, enum: DEPARTMENTS, default: null, index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: STATUSES, default: 'Submitted', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', index: true },
  slaDeadline: { type: Date, required: true, index: true },
  isEscalated: { type: Boolean, default: false, index: true },
  escalatedAt: { type: Date, default: null },
  history: { type: [historySchema], default: [] },
}, { timestamps: true });

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1, slaDeadline: 1 });
complaintSchema.index({ assignedDepartment: 1, status: 1 });

module.exports = {
  Complaint: mongoose.model('Complaint', complaintSchema),
  CATEGORIES,
  STATUSES,
  DEPARTMENTS,
};
