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

const complaintImageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  storageKey: { type: String, required: true, maxlength: 255 },
  displayName: { type: String, required: true, maxlength: 180 },
  mimeType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
  size: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
  uploadedAt: { type: Date, required: true, default: Date.now },
}, { _id: false });

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function (coords) {
        return Array.isArray(coords) &&
          coords.length === 2 &&
          typeof coords[0] === 'number' && Number.isFinite(coords[0]) &&
          typeof coords[1] === 'number' && Number.isFinite(coords[1]) &&
          coords[0] >= -180 && coords[0] <= 180 &&
          coords[1] >= -90 && coords[1] <= 90;
      },
      message: 'Coordinates must be [longitude, latitude] with longitude between -180 and 180 and latitude between -90 and 90.',
    },
  },
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  category: { type: String, enum: CATEGORIES, required: true },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  geoLocation: { type: pointSchema, default: null, required: false },
  imageUrl: { type: String, default: null, maxlength: 500 },
  images: { type: [complaintImageSchema], default: [] },
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
complaintSchema.index({ geoLocation: '2dsphere' }, { sparse: true });

module.exports = {
  Complaint: mongoose.model('Complaint', complaintSchema),
  CATEGORIES,
  STATUSES,
  DEPARTMENTS,
};
