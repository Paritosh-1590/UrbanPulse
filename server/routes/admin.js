const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../services/security');
const { Complaint, STATUSES, DEPARTMENTS } = require('../models/Complaint');
const { isOverdue, applySlaEscalations } = require('../services/sla');
const { buildAdminComplaintFilter } = require('../services/access');

const FINAL_STATUSES = ['Resolved', 'Rejected'];
const TRANSITIONS = {
  Submitted: ['Rejected'],
  Assigned: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected'],
  Resolved: [],
  Rejected: [],
};

function createAdminRouter() {
  const router = express.Router();

  router.get('/departments', (req, res) => res.json({ success: true, data: { departments: DEPARTMENTS } }));

  router.get('/summary', async (req, res) => {
    await applySlaEscalations();
    const filter = req.user.role === 'department_official' ? { assignedDepartment: req.user.department } : {};
    const openFilter = { ...filter, status: { $nin: FINAL_STATUSES } };
    const [total, submitted, inProgress, resolved, rejected, overdue] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Submitted' }),
      Complaint.countDocuments({ ...filter, status: { $in: ['Assigned', 'In Progress'] } }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Rejected' }),
      Complaint.countDocuments({ ...openFilter, slaDeadline: { $lt: new Date() } }),
    ]);
    return res.json({ success: true, data: { total, submitted, inProgress, resolved, rejected, overdue } });
  });

  router.get('/complaints', async (req, res) => {
    await applySlaEscalations();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
    const filter = buildAdminComplaintFilter(req.user, req.query);
    const [items, total] = await Promise.all([
      Complaint.find(filter).sort({ isEscalated: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('citizen', 'name email').populate('assignedTo', 'name email department').lean(),
      Complaint.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items: items.map((item) => ({ ...item, isOverdue: isOverdue(item) })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  });

  router.patch('/complaints/:id/assign', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only administrators can assign complaints.' });
    if (!DEPARTMENTS.includes(req.body.department)) return res.status(400).json({ success: false, message: 'Choose a valid department.' });

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (FINAL_STATUSES.includes(complaint.status)) return res.status(409).json({ success: false, message: 'A closed complaint cannot be reassigned.' });

    let assignedTo = null;
    if (req.body.assignedTo) {
      if (!mongoose.isValidObjectId(req.body.assignedTo)) return res.status(400).json({ success: false, message: 'Invalid department official.' });
      assignedTo = await User.findOne({ _id: req.body.assignedTo, role: 'department_official', department: req.body.department }).select('_id name');
      if (!assignedTo) return res.status(400).json({ success: false, message: 'The selected official is not in this department.' });
    }

    const previousDepartment = complaint.assignedDepartment;
    complaint.assignedDepartment = req.body.department;
    complaint.assignedTo = assignedTo ? assignedTo._id : null;
    if (complaint.status === 'Submitted') complaint.status = 'Assigned';
    complaint.history.push({
      action: 'Department assignment',
      note: `Assigned to ${req.body.department}${assignedTo ? ` (${assignedTo.name})` : ''}${previousDepartment && previousDepartment !== req.body.department ? `; previously ${previousDepartment}` : ''}.`,
      status: complaint.status,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });
    await complaint.save();
    return res.json({ success: true, data: { complaint } });
  });

  router.patch('/complaints/:id/status', async (req, res) => {
    const nextStatus = String(req.body.status || '');
    if (!STATUSES.includes(nextStatus)) return res.status(400).json({ success: false, message: 'Choose a valid complaint status.' });
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    if (req.user.role === 'department_official' && complaint.assignedDepartment !== req.user.department) {
      return res.status(403).json({ success: false, message: 'This complaint is not assigned to your department.' });
    }
    if (req.user.role === 'department_official' && !['In Progress', 'Resolved'].includes(nextStatus)) {
      return res.status(403).json({ success: false, message: 'Department officials can move assigned complaints to In Progress or Resolved.' });
    }
    if (!TRANSITIONS[complaint.status].includes(nextStatus) && complaint.status !== nextStatus) {
      return res.status(409).json({ success: false, message: `Cannot move a ${complaint.status} complaint to ${nextStatus}.` });
    }
    if (complaint.status === nextStatus) return res.json({ success: true, data: { complaint }, message: 'No status change was needed.' });

    const note = String(req.body.note || '').trim().slice(0, 500);
    complaint.status = nextStatus;
    if (FINAL_STATUSES.includes(nextStatus)) {
      complaint.isEscalated = false;
    }
    complaint.history.push({
      action: `Status changed to ${nextStatus}`,
      note: note || `Status updated by ${req.user.name}.`,
      status: nextStatus,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });
    await complaint.save();
    return res.json({ success: true, data: { complaint } });
  });

  router.post('/department-officials', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only administrators can create department accounts.' });
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const department = String(req.body.department || '');
    if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (password.length < 12 || password.length > 128) return res.status(400).json({ success: false, message: 'Department passwords must be at least 12 characters.' });
    if (!DEPARTMENTS.includes(department)) return res.status(400).json({ success: false, message: 'Choose a valid department.' });
    if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const official = await User.create({ name, email, passwordHash: await hashPassword(password), role: 'department_official', department });
    return res.status(201).json({ success: true, data: { official: { id: String(official._id), name: official.name, email: official.email, department: official.department } } });
  });

  router.get('/department-officials', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only administrators can view staff directory.' });
    const department = String(req.query.department || '');
    const filter = { role: 'department_official' };
    if (department && DEPARTMENTS.includes(department)) filter.department = department;
    const officials = await User.find(filter).select('name email department').sort({ name: 1 }).lean();
    return res.json({ success: true, data: { officials } });
  });

  return router;
}

module.exports = createAdminRouter;
