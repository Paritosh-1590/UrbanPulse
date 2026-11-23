const express = require('express');
const mongoose = require('mongoose');
const { Complaint, CATEGORIES, STATUSES } = require('../models/Complaint');
const { inferPriority, slaDays } = require('../services/classifier');
const { suggestCategory } = require('../services/ml-client');
const { isOverdue } = require('../services/sla');
const { canReadComplaint, escapeRegex } = require('../services/access');

function makeComplaintId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `UP-${stamp}-${suffix}`;
}

function createComplaintsRouter(config) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    if (req.user.role !== 'citizen') return res.status(403).json({ success: false, message: 'Only citizen accounts can submit complaints.' });
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = String(req.body.category || '').trim();
    const location = String(req.body.location || '').trim();

    if (title.length < 5 || title.length > 120) return res.status(400).json({ success: false, message: 'Title must be between 5 and 120 characters.' });
    if (description.length < 20 || description.length > 2000) return res.status(400).json({ success: false, message: 'Description must be between 20 and 2,000 characters.' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Select a valid complaint category.' });
    if (!location || location.length > 200) return res.status(400).json({ success: false, message: 'Enter a location up to 200 characters.' });

    const predicted = await suggestCategory(`${title} ${description}`, config);
    const priority = inferPriority(`${title} ${description}`);
    const now = new Date();
    const complaint = await Complaint.create({
      complaintId: makeComplaintId(),
      title,
      description,
      category,
      location,
      citizen: req.user._id,
      priority,
      slaDeadline: new Date(now.getTime() + slaDays(category, priority) * 24 * 60 * 60 * 1000),
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

  return router;
}

module.exports = createComplaintsRouter;
