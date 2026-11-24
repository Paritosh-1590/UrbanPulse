const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs/promises');
const { Complaint, CATEGORIES, STATUSES } = require('../models/Complaint');
const { inferPriority, slaDays } = require('../services/classifier');
const { suggestCategory } = require('../services/ml-client');
const { isOverdue } = require('../services/sla');
const { canReadComplaint, escapeRegex } = require('../services/access');
const { validateAndNormalizeCoordinates } = require('../services/location');
const {
  MAX_FILE_SIZE,
  MAX_FILES,
  validateFiles,
  writeValidatedFiles,
  removeFiles,
} = require('../services/complaint-images');

function makeComplaintId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `UP-${stamp}-${suffix}`;
}

function createComplaintsRouter(config) {
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: MAX_FILES,
      fields: 20,
    },
  });

  router.post('/', upload.array('images', MAX_FILES), async (req, res) => {
    if (req.user.role !== 'citizen') return res.status(403).json({ success: false, message: 'Only citizen accounts can submit complaints.' });
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = String(req.body.category || '').trim();
    const location = String(req.body.location || '').trim();

    if (title.length < 5 || title.length > 120) return res.status(400).json({ success: false, message: 'Title must be between 5 and 120 characters.' });
    if (description.length < 20 || description.length > 2000) return res.status(400).json({ success: false, message: 'Description must be between 20 and 2,000 characters.' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Select a valid complaint category.' });
    if (!location || location.length > 200) return res.status(400).json({ success: false, message: 'Enter a location up to 200 characters.' });

    let geoLocation = null;
    try {
      if (req.body.geoLocation !== undefined && req.body.geoLocation !== '') {
        geoLocation = validateAndNormalizeCoordinates(req.body.geoLocation);
      } else if (
        req.body.latitude !== undefined &&
        req.body.longitude !== undefined &&
        req.body.latitude !== '' &&
        req.body.longitude !== ''
      ) {
        geoLocation = validateAndNormalizeCoordinates({
          latitude: req.body.latitude,
          longitude: req.body.longitude,
        });
      }
    } catch (geoError) {
      return res.status(400).json({ success: false, message: geoError.message });
    }

    const predicted = await suggestCategory(`${title} ${description}`, config);
    const priority = inferPriority(`${title} ${description}`);
    const now = new Date();
    let writtenImages = [];
    try {
      const validatedImages = validateFiles(req.files);
      writtenImages = await writeValidatedFiles(req.files || [], validatedImages, config.uploadDir);
      const complaint = await Complaint.create({
        complaintId: makeComplaintId(),
        title,
        description,
        category,
        location,
        geoLocation,
        citizen: req.user._id,
        priority,
        slaDeadline: new Date(now.getTime() + slaDays(category, priority) * 24 * 60 * 60 * 1000),
        images: writtenImages,
        history: [{
          action: 'Complaint submitted',
          note: 'The complaint was received and added to the civic issue queue.',
          status: 'Submitted',
          changedBy: req.user._id,
          changedByName: req.user.name,
          createdAt: now,
        }, {
          action: 'Category suggestion',
          note: `Suggested category: ${predicted.category} (${predicted.source}). Citizen-selected category retained: ${category}.`,
          changedByName: 'UrbanPulse classifier',
          createdAt: now,
        }],
      });

      return res.status(201).json({ success: true, data: { complaint, aiSuggestion: predicted } });
    } catch (error) {
      await removeFiles(writtenImages, config.uploadDir);
      throw error;
    }
  });

  router.get('/', async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};

    if (req.user.role === 'citizen') filter.citizen = req.user._id;
    else if (req.user.role === 'department_official') filter.assignedDepartment = req.user.department;
    if (typeof req.query.status === 'string' && STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (typeof req.query.category === 'string' && CATEGORIES.includes(req.query.category)) filter.category = req.query.category;

    const query = String(req.query.q || '').trim();
    if (query) {
      const safeQuery = escapeRegex(query.slice(0, 100));
      filter.$or = [
        { complaintId: { $regex: safeQuery, $options: 'i' } },
        { title: { $regex: safeQuery, $options: 'i' } },
        { category: { $regex: safeQuery, $options: 'i' } },
        { location: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('citizen', 'name email').lean(),
      Complaint.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items: items.map((item) => ({ ...item, isOverdue: isOverdue(item) })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  });

  router.get('/summary', async (req, res) => {
    const filter = req.user.role === 'citizen' ? { citizen: req.user._id }
      : req.user.role === 'department_official' ? { assignedDepartment: req.user.department } : {};
    const [total, submitted, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Submitted' }),
      Complaint.countDocuments({ ...filter, status: { $in: ['Assigned', 'In Progress'] } }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Rejected' }),
    ]);
    return res.json({ success: true, data: { total, submitted, inProgress, resolved, rejected } });
  });

  router.get('/:id', async (req, res) => {
    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { complaintId: req.params.id }] }
      : { complaintId: req.params.id };
    const complaint = await Complaint.findOne(lookup).populate('citizen', 'name email').populate('assignedTo', 'name email department').lean();
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (!canReadComplaint(req.user, complaint)) return res.status(403).json({ success: false, message: 'You cannot view this complaint.' });
    return res.json({ success: true, data: { complaint: { ...complaint, isOverdue: isOverdue(complaint) } } });
  });

  router.get('/:id/images/:imageId', async (req, res, next) => {
    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { complaintId: req.params.id }] }
      : { complaintId: req.params.id };
    const complaint = await Complaint.findOne(lookup).populate('citizen', 'name email').lean();
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (!canReadComplaint(req.user, complaint)) return res.status(403).json({ success: false, message: 'You cannot view this complaint evidence.' });

    const image = (complaint.images || []).find((item) => item.id === req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Complaint image not found.' });

    const safeKey = path.basename(image.storageKey);
    if (!safeKey || safeKey !== image.storageKey) return res.status(404).json({ success: false, message: 'Complaint image not found.' });
    const absolutePath = path.resolve(config.uploadDir, safeKey);
    const uploadRoot = path.resolve(config.uploadDir);
    if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) return res.status(404).json({ success: false, message: 'Complaint image not found.' });

    try {
      await fs.access(absolutePath);
    } catch (error) {
      return res.status(404).json({ success: false, message: 'The uploaded image is missing from local storage.' });
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${image.displayName.replace(/["\r\n]/g, '_')}"`);
    return res.sendFile(absolutePath);
  });

  return router;
}

module.exports = createComplaintsRouter;
